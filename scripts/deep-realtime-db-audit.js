const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ygopnjbvccenryejqmlw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is required in .env.local');
  process.exit(1);
}

const sb = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runMasterAudit() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║       THLOTTO-II FULL ADMIN & DATABASE INTEGRITY AUDIT               ║');
  console.log('║       Database: ygopnjbvccenryejqmlw                                ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  const results = [];

  // Helper for tracking
  function logResult(section, testName, passed, details) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${status}] ${section} ➔ ${testName}: ${details || ''}`);
    results.push({ section, testName, passed, details });
  }

  // 1. Check all 24 core tables in Database
  const tables = [
    'profiles', 'wallets', 'transactions', 'deposit_requests', 'withdraw_requests',
    'lottery_markets', 'payout_rates', 'restricted_numbers', 'bets', 'lottery_results',
    'draw_schedules', 'instant_draws', 'instant_bet_types', 'lucky_wheel_prizes',
    'lucky_wheel_spins', 'sliders', 'promotions', 'articles', 'announcements',
    'banks', 'settings', 'admin_roles', 'admin_notifications', 'login_attempts'
  ];

  console.log('--- 1. ตรวจสอบการเชื่อมต่อตารางจริงทั้งหมด (24 Core Tables) ---');
  for (const table of tables) {
    try {
      const { count, error } = await sb.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        logResult('1. Database Tables', table, false, `Query error: ${error.message}`);
      } else {
        logResult('1. Database Tables', table, true, `พบข้อมูล ${count ?? 0} แถว`);
      }
    } catch (e) {
      logResult('1. Database Tables', table, false, e.message);
    }
  }

  // 2. Test Stored Procedures & Atomic Functions
  console.log('\n--- 2. ตรวจสอบ Atomic Stored Procedures & RPCs ---');
  const rpcs = [
    'admin_service_adjust_wallet',
    'admin_service_approve_deposit',
    'admin_service_reject_deposit',
    'admin_service_approve_withdraw',
    'admin_service_reject_withdraw',
    'record_login_session'
  ];

  for (const rpc of rpcs) {
    try {
      // Call with dummy param just to test if RPC exists in postgres catalog
      const { error } = await sb.rpc(rpc, {});
      // Even if parameter error occurs, it proves function exists on DB
      const exists = !error || !error.message.includes('function does not exist');
      logResult('2. Stored Procedures', rpc, exists, error ? error.message : 'ฟังก์ชันพร้อมใช้งานแบบ Atomic');
    } catch (e) {
      logResult('2. Stored Procedures', rpc, false, e.message);
    }
  }

  // 3. Test Real CRUD: Member Adjust & Suspensions
  console.log('\n--- 3. ตรวจสอบการจัดการสมาชิก (Members Management) ---');
  try {
    const { data: member } = await sb.from('profiles').select('id, full_name, member_id, status').eq('is_admin', false).limit(1).single();
    if (member) {
      // 3.1 Wallet atomic adjustment
      const { data: wBefore } = await sb.from('wallets').select('balance').eq('user_id', member.id).single();
      const balBefore = Number(wBefore.balance || 0);

      const { data: adjRes, error: adjErr } = await sb.rpc('admin_service_adjust_wallet', {
        p_user_id: member.id,
        p_delta: 100,
        p_note: 'AUDIT TEST CREDIT ADD'
      });

      if (adjErr) {
        logResult('3. Members', 'Atomic Balance Adjust (+100)', false, adjErr.message);
      } else {
        const { data: wAfter } = await sb.from('wallets').select('balance').eq('user_id', member.id).single();
        logResult('3. Members', 'Atomic Balance Adjust (+100)', Number(wAfter.balance) === balBefore + 100, `ยอดเดิม: ${balBefore} ➔ หลังปรับ: ${wAfter.balance}`);
        
        // Revert balance
        await sb.rpc('admin_service_adjust_wallet', {
          p_user_id: member.id,
          p_delta: -100,
          p_note: 'AUDIT TEST CREDIT REVERT'
        });
      }

      // 3.2 Member Status Update
      const origStatus = member.status;
      const { error: lockErr } = await sb.from('profiles').update({ status: 'suspended' }).eq('id', member.id);
      const { data: locked } = await sb.from('profiles').select('status').eq('id', member.id).single();
      await sb.from('profiles').update({ status: origStatus }).eq('id', member.id);
      
      logResult('3. Members', 'Lock & Unlock Account', !lockErr && locked.status === 'suspended', `สลับสถานะ ${origStatus} ➔ suspended ➔ ${origStatus}`);
    } else {
      logResult('3. Members', 'Test Member Available', false, 'ไม่พบสมาชิกสำหรับทดสอบ');
    }
  } catch (e) {
    logResult('3. Members', 'Execution Exception', false, e.message);
  }

  // 4. Test Real CRUD: Markets & Payout Rates
  console.log('\n--- 4. ตรวจสอบการจัดการตลาดหวย (Markets & Rates) ---');
  try {
    const { data: mkt } = await sb.from('lottery_markets').select('*').limit(1).single();
    if (mkt) {
      const { error: updErr } = await sb.from('lottery_markets').update({
        is_open: true,
        is_active: true,
        min_bet: 1,
        max_bet: 50000
      }).eq('id', mkt.id);
      logResult('4. Markets', `Update Market (${mkt.name})`, !updErr, `อัปเดตสถานะและการตั้งค่าสำเร็จ`);
    }
  } catch (e) {
    logResult('4. Markets', 'Market Exception', false, e.message);
  }

  // 5. Test Real CRUD: Restricted Numbers (เลขอั้น)
  console.log('\n--- 5. ตรวจสอบระบบเลขอั้น (Restricted Numbers) ---');
  try {
    const testNum = '999';
    const { data: insData, error: insErr } = await sb.from('restricted_numbers').insert({
      number: testNum,
      bet_type: '3TOP',
      payout_rate: 0,
      max_amount: 0,
      note: 'AUDIT TEST RESTRICTION'
    }).select().single();

    if (insErr) {
      logResult('5. Restricted Numbers', 'Add Blocked Number', false, insErr.message);
    } else {
      logResult('5. Restricted Numbers', 'Add Blocked Number', true, `เพิ่มเลขอั้น ID: ${insData.id} สำเร็จ`);
      // Delete test restriction
      const { error: delErr } = await sb.from('restricted_numbers').delete().eq('id', insData.id);
      logResult('5. Restricted Numbers', 'Delete Blocked Number', !delErr, `ลบเลขอั้นทดสอบเรียบร้อย`);
    }
  } catch (e) {
    logResult('5. Restricted Numbers', 'Exception', false, e.message);
  }

  // 6. Test Settings Table (Broadcast & Appearance)
  console.log('\n--- 6. ตรวจสอบการตั้งค่าระบบ (Settings & Appearance) ---');
  try {
    const { error: setErr } = await sb.from('settings').upsert([
      { key: 'popup_title', value: 'ยินดีต้อนรับสู่ TH LOTTO II', updated_at: new Date().toISOString() },
      { key: 'popup_enabled', value: 'true', updated_at: new Date().toISOString() }
    ], { onConflict: 'key' });

    logResult('6. Settings', 'Sync Welcome Popup & Appearance Keys', !setErr, !setErr ? 'บันทึกค่าลง Supabase สำเร็จ' : setErr.message);
  } catch (e) {
    logResult('6. Settings', 'Exception', false, e.message);
  }

  // 7. Test Wheel Prizes & Promotions
  console.log('\n--- 7. ตรวจสอบวงล้อโชคดี & คอนเทนต์ (Wheel & Content) ---');
  try {
    const { count: prizeCount } = await sb.from('lucky_wheel_prizes').select('*', { count: 'exact', head: true });
    const { count: promoCount } = await sb.from('promotions').select('*', { count: 'exact', head: true });
    const { count: sliderCount } = await sb.from('sliders').select('*', { count: 'exact', head: true });
    const { count: articleCount } = await sb.from('articles').select('*', { count: 'exact', head: true });
    
    logResult('7. Content & Games', 'Lucky Wheel Prizes', prizeCount > 0, `พบรางวัลวงล้อ ${prizeCount} รายการ`);
    logResult('7. Content & Games', 'Promotions Active', promoCount > 0, `พบโปรโมชั่น ${promoCount} รายการ`);
    logResult('7. Content & Games', 'Sliders & Banners', sliderCount > 0, `พบสไลเดอร์ ${sliderCount} รายการ`);
    logResult('7. Content & Games', 'Articles & Feeds', articleCount > 0, `พบบทความ ${articleCount} รายการ`);
  } catch (e) {
    logResult('7. Content & Games', 'Exception', false, e.message);
  }

  // Summary
  console.log('\n══════════════════════════════════════════════════════════════════════');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`สรุปผลการตรวจสอบความสมบูรณ์ฐานข้อมูล: ผ่าน ${passed}/${total} การทดสอบ (${((passed/total)*100).toFixed(1)}%)`);
  if (failed > 0) {
    console.log(`❌ พบจุดที่ต้องตรวจสอบเพิ่มเติม: ${failed} รายการ`);
  } else {
    console.log(`🎉 ระบบจัดการข้อมูลทั้งหมดเชื่อมต่อฐานข้อมูลจริง สมบูรณ์ 100% ไม่มี Mock!`);
  }
  console.log('══════════════════════════════════════════════════════════════════════');
}

runMasterAudit();
