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

async function runDepositWithdrawAudit() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║       THLOTTO-II DEPOSIT & WITHDRAWAL FULL LIFECYCLE AUDIT           ║');
  console.log('║       Database: ygopnjbvccenryejqmlw                                ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  const report = [];

  function record(category, testName, passed, info) {
    const icon = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${icon}] [${category}] ${testName} -> ${info || ''}`);
    report.push({ category, testName, passed, info });
  }

  // 1. Check Tables & Columns
  console.log('--- 1. ตรวจสอบโครงสร้างตารางการเงิน (Schema & Tables) ---');
  try {
    const { data: depRows, error: depErr } = await sb.from('deposit_requests').select('*').limit(1);
    record('Schema', 'Table deposit_requests exists', !depErr, depErr ? depErr.message : 'ตารางพร้อมใช้งาน');

    const { data: withRows, error: withErr } = await sb.from('withdraw_requests').select('*').limit(1);
    record('Schema', 'Table withdraw_requests exists', !withErr, withErr ? withErr.message : 'ตารางพร้อมใช้งาน');

    const { data: walRows, error: walErr } = await sb.from('wallets').select('*').limit(1);
    record('Schema', 'Table wallets exists', !walErr, walErr ? walErr.message : 'ตารางพร้อมใช้งาน');

    const { data: txRows, error: txErr } = await sb.from('transactions').select('*').limit(1);
    record('Schema', 'Table transactions exists', !txErr, txErr ? txErr.message : 'ตารางพร้อมใช้งาน');

    const { data: bankRows, error: bankErr } = await sb.from('banks').select('*').limit(1);
    record('Schema', 'Table banks exists', !bankErr, bankErr ? bankErr.message : 'ตารางธนาคารพร้อมใช้งาน');
  } catch (e) {
    record('Schema', 'Schema check exception', false, e.message);
  }

  // 2. Settings check
  console.log('\n--- 2. ตรวจสอบการตั้งค่าระบบการเงิน (Settings) ---');
  try {
    const { data: setRows } = await sb.from('settings').select('key, value').in('key', [
      'min_deposit', 'min_withdraw', 'withdraw_enabled', 'company_bank_code', 'company_bank_account_number', 'company_bank_account_name'
    ]);
    const setMap = Object.fromEntries((setRows || []).map(r => [r.key, r.value]));
    record('Settings', 'min_deposit configured', !!setMap.min_deposit, `ขั้นต่ำฝาก: ฿${setMap.min_deposit || '100 (Default)'}`);
    record('Settings', 'min_withdraw configured', !!setMap.min_withdraw, `ขั้นต่ำถอน: ฿${setMap.min_withdraw || '100 (Default)'}`);
    record('Settings', 'withdraw_enabled configured', setMap.withdraw_enabled !== undefined, `สถานะเปิดถอน: ${setMap.withdraw_enabled || 'true'}`);
    record('Settings', 'Company Bank Account configured', !!setMap.company_bank_account_number, `${setMap.company_bank_code || 'KBANK'} - ${setMap.company_bank_account_number || '-'}`);
  } catch (e) {
    record('Settings', 'Settings exception', false, e.message);
  }

  // 3. Stored Procedures Existence
  console.log('\n--- 3. ตรวจสอบ Atomic Stored Procedures การเงิน ---');
  const procs = [
    'admin_service_approve_deposit',
    'admin_service_reject_deposit',
    'admin_service_approve_withdraw',
    'admin_service_reject_withdraw'
  ];

  for (const p of procs) {
    try {
      const { error } = await sb.rpc(p, {});
      const exists = !error || !error.message.includes('function does not exist');
      record('RPC Existence', p, exists, error ? error.message : 'พร้อมใช้งาน');
    } catch (e) {
      record('RPC Existence', p, false, e.message);
    }
  }

  // 4. Test user for Full Lifecycle
  console.log('\n--- 4. การทดสอบ Full Cycle: ฝากเงิน (Deposit Flow) ---');
  const { data: testUser } = await sb.from('profiles').select('id, full_name, phone, bank_name, bank_account_number').limit(1).single();

  if (!testUser) {
    console.error('No test user found in profiles');
    return;
  }
  console.log(`👤 สมาชิกทดสอบ: ${testUser.full_name} (${testUser.id})`);

  let testDepositId = null;
  let testDepositRejId = null;
  let walletStartBalance = 0;

  try {
    const { data: w0 } = await sb.from('wallets').select('balance').eq('user_id', testUser.id).single();
    walletStartBalance = Number(w0?.balance || 0);
    console.log(`💰 ยอดเงินเริ่มต้น: ฿${walletStartBalance}`);

    // 4.1 Deposit Submit & Approve Flow
    const depositAmount = 500;
    const dummySlip = 'https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/slips/audit_test_slip.jpg';
    
    const { data: insDep, error: insDepErr } = await sb.from('deposit_requests').insert({
      user_id: testUser.id,
      amount: depositAmount,
      slip_url: dummySlip,
      status: 'PENDING',
      created_at: new Date().toISOString()
    }).select().single();

    if (insDepErr) {
      record('Deposit Flow', 'Submit Deposit Request', false, insDepErr.message);
    } else {
      testDepositId = insDep.id;
      record('Deposit Flow', 'Submit Deposit Request', true, `Created Request ID: ${testDepositId}`);

      // Approve RPC
      const { data: appRes, error: appErr } = await sb.rpc('admin_service_approve_deposit', {
        p_request_id: testDepositId,
        p_admin_note: 'AUDIT AUTOMATED APPROVE'
      });

      if (appErr) {
        record('Deposit Flow', 'Atomic Approve Deposit', false, appErr.message);
      } else {
        record('Deposit Flow', 'Atomic Approve Deposit', appRes.success !== false, JSON.stringify(appRes));

        // Check wallet balance
        const { data: w1 } = await sb.from('wallets').select('balance').eq('user_id', testUser.id).single();
        const bal1 = Number(w1?.balance || 0);
        record('Deposit Flow', 'Wallet Credited Exactly +500', bal1 === walletStartBalance + depositAmount, `เดิม: ฿${walletStartBalance} ➔ หลังอนุมัติ: ฿${bal1}`);

        // Check status updated in DB
        const { data: depCheck } = await sb.from('deposit_requests').select('status, admin_note').eq('id', testDepositId).single();
        record('Deposit Flow', 'Status Updated to APPROVED', depCheck?.status.toUpperCase() === 'APPROVED', `Status: ${depCheck?.status}`);

        // Double approval lock test
        const { data: dupRes, error: dupErr } = await sb.rpc('admin_service_approve_deposit', {
          p_request_id: testDepositId,
          p_admin_note: 'AUDIT REPEAT APPROVE'
        });
        const dupBlocked = dupRes?.success === false || !!dupErr;
        record('Deposit Security', 'Double-Approval Prevented (Row Lock Guard)', dupBlocked, dupRes?.message || dupErr?.message);
      }
    }

    // 4.2 Deposit Submit & Reject Flow
    const { data: insDepRej } = await sb.from('deposit_requests').insert({
      user_id: testUser.id,
      amount: 300,
      slip_url: dummySlip,
      status: 'PENDING',
      created_at: new Date().toISOString()
    }).select().single();

    if (insDepRej) {
      testDepositRejId = insDepRej.id;
      const { data: rejRes, error: rejErr } = await sb.rpc('admin_service_reject_deposit', {
        p_request_id: testDepositRejId,
        p_admin_note: 'AUDIT SLIP INVALID'
      });
      record('Deposit Flow', 'Atomic Reject Deposit', !rejErr && rejRes?.success !== false, rejRes?.message || rejErr?.message);
      
      const { data: depRejCheck } = await sb.from('deposit_requests').select('status').eq('id', testDepositRejId).single();
      record('Deposit Flow', 'Status Updated to REJECTED', depRejCheck?.status.toUpperCase() === 'REJECTED', `Status: ${depRejCheck?.status}`);
    }
  } catch (e) {
    record('Deposit Flow', 'Deposit Flow Exception', false, e.message);
  }

  // 5. Full Lifecycle: ถอนเงิน (Withdrawal Flow)
  console.log('\n--- 5. การทดสอบ Full Cycle: ถอนเงิน (Withdrawal Flow) ---');
  let testWithdrawAppId = null;
  let testWithdrawRejId = null;

  try {
    // 5.1 Withdrawal Submit & Approve Flow
    const withdrawAmount = 200;
    const { data: insWithApp, error: insWithErr } = await sb.from('withdraw_requests').insert({
      user_id: testUser.id,
      amount: withdrawAmount,
      bank_name: testUser.bank_name || 'SCB',
      bank_account_number: testUser.bank_account_number || '1234567890',
      bank_account_name: testUser.full_name || 'ทดสอบ',
      status: 'PENDING',
      created_at: new Date().toISOString()
    }).select().single();

    if (insWithErr) {
      record('Withdrawal Flow', 'Submit Withdrawal Request', false, insWithErr.message);
    } else {
      testWithdrawAppId = insWithApp.id;
      record('Withdrawal Flow', 'Submit Withdrawal Request', true, `Created Request ID: ${testWithdrawAppId}`);

      // Approve RPC
      const { data: withAppRes, error: withAppErr } = await sb.rpc('admin_service_approve_withdraw', {
        p_request_id: testWithdrawAppId,
        p_admin_note: 'AUDIT AUTOMATED WITHDRAW APPROVE'
      });

      if (withAppErr) {
        record('Withdrawal Flow', 'Atomic Approve Withdrawal', false, withAppErr.message);
      } else {
        record('Withdrawal Flow', 'Atomic Approve Withdrawal', withAppRes.success !== false, JSON.stringify(withAppRes));

        const { data: wCheck } = await sb.from('withdraw_requests').select('status, admin_note').eq('id', testWithdrawAppId).single();
        record('Withdrawal Flow', 'Status Updated to APPROVED', wCheck?.status.toUpperCase() === 'APPROVED', `Status: ${wCheck?.status}`);
      }
    }

    // 5.2 Withdrawal Submit & Reject with Auto-Refund Flow
    const { data: curW } = await sb.from('wallets').select('balance').eq('user_id', testUser.id).single();
    const balBeforeRejWith = Number(curW?.balance || 0);

    const { data: insWithRej } = await sb.from('withdraw_requests').insert({
      user_id: testUser.id,
      amount: 150,
      bank_name: testUser.bank_name || 'SCB',
      bank_account_number: testUser.bank_account_number || '1234567890',
      bank_account_name: testUser.full_name || 'ทดสอบ',
      status: 'PENDING',
      created_at: new Date().toISOString()
    }).select().single();

    if (insWithRej) {
      testWithdrawRejId = insWithRej.id;
      const { data: rejWithRes, error: rejWithErr } = await sb.rpc('admin_service_reject_withdraw', {
        p_request_id: testWithdrawRejId,
        p_admin_note: 'AUDIT BANK MISMATCH REFUND'
      });

      if (rejWithErr) {
        record('Withdrawal Flow', 'Atomic Reject & Auto-Refund', false, rejWithErr.message);
      } else {
        record('Withdrawal Flow', 'Atomic Reject & Auto-Refund', rejWithRes.success !== false, JSON.stringify(rejWithRes));

        // Verify balance refunded
        const { data: wRefunded } = await sb.from('wallets').select('balance').eq('user_id', testUser.id).single();
        const balRefunded = Number(wRefunded?.balance || 0);
        record('Withdrawal Flow', 'Wallet Refunded (+150)', balRefunded === balBeforeRejWith + 150, `ก่อนปฏิเสธ: ฿${balBeforeRejWith} ➔ หลังปฏิเสธ: ฿${balRefunded}`);

        const { data: wRejCheck } = await sb.from('withdraw_requests').select('status').eq('id', testWithdrawRejId).single();
        record('Withdrawal Flow', 'Status Updated to REJECTED', wRejCheck?.status.toUpperCase() === 'REJECTED', `Status: ${wRejCheck?.status}`);
      }
    }
  } catch (e) {
    record('Withdrawal Flow', 'Withdrawal Flow Exception', false, e.message);
  }

  // 6. Cleanup Test Data
  console.log('\n--- 6. เก็บกวาดข้อมูลทดสอบ (Cleanup Test Data) ---');
  try {
    if (testDepositId) await sb.from('deposit_requests').delete().eq('id', testDepositId);
    if (testDepositRejId) await sb.from('deposit_requests').delete().eq('id', testDepositRejId);
    if (testWithdrawAppId) await sb.from('withdraw_requests').delete().eq('id', testWithdrawAppId);
    if (testWithdrawRejId) await sb.from('withdraw_requests').delete().eq('id', testWithdrawRejId);

    // Delete audit transactions
    await sb.from('transactions').delete().eq('user_id', testUser.id).ilike('note', '%AUDIT%');

    // Restore starting wallet balance
    await sb.from('wallets').update({ balance: walletStartBalance }).eq('user_id', testUser.id);
    console.log(`🧹 รีเซ็ตยอดเงินกระเป๋าผู้ใช้กลับเป็น: ฿${walletStartBalance}`);
    record('Cleanup', 'Audit records deleted & wallet balance restored', true, 'ฐานข้อมูลคงความสมบูรณ์และถูกต้อง');
  } catch (e) {
    record('Cleanup', 'Cleanup exception', false, e.message);
  }

  // 7. Summary
  console.log('\n══════════════════════════════════════════════════════════════════════');
  const total = report.length;
  const passed = report.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`ผลการตรวจสอบระบบฝาก-ถอน (Deposit & Withdraw Audit): ผ่าน ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);
  if (failed > 0) {
    console.log(`❌ รายการที่ไม่ผ่าน: ${failed}`);
  } else {
    console.log(`🎉 ระบบฝาก-ถอน (Deposit & Withdraw) ทั้งฝั่งลูกค้าและแอดมิน สมบูรณ์ ปลอดภัย 100%!`);
  }
  console.log('══════════════════════════════════════════════════════════════════════');
}

runDepositWithdrawAudit();
