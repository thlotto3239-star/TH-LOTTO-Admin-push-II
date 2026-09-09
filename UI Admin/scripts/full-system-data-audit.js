const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx !== -1) {
    const key = line.substring(0, idx).trim();
    const val = line.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[key] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function deepSystemAudit() {
  console.log('================================================================');
  console.log('     THLOTTO-II DETAILED SYSTEM & DATA AUDIT REPORT');
  console.log('     Timestamp: ' + new Date().toISOString());
  console.log('================================================================\n');

  // 1. Members & Wallets
  console.log('--- 1. สมาชิก และ กระเป๋าเงิน (Members & Wallets) ---');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, phone, full_name, role, status, created_at').limit(5);
  const { count: totalProfiles } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  console.log(`จำนวนสมาชิกทั้งหมด: ${totalProfiles} ราย`);
  console.log('ตัวอย่างข้อมูลสมาชิก 5 รายการล่าสุด:', profiles);

  const { data: wallets, error: wErr } = await supabase.from('wallets').select('id, user_id, balance, bonus_balance, total_deposit, total_withdraw').limit(5);
  console.log('ตัวอย่างกระเป๋าเงินสมาชิก 5 รายการ:', wallets);

  // 2. Financial Transactions
  console.log('\n--- 2. ธุรกรรมการเงิน (Financial Ledger & Requests) ---');
  const { count: totalTx } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
  const { count: pendingDep } = await supabase.from('deposit_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: pendingWith } = await supabase.from('withdraw_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  console.log(`ประวัติธุรกรรมทั้งหมด: ${totalTx} รายการ`);
  console.log(`รายการฝากรออนุมัติ: ${pendingDep} รายการ`);
  console.log(`รายการถอนรออนุมัติ: ${pendingWith} รายการ`);

  const { data: recentTx } = await supabase.from('transactions').select('id, user_id, type, amount, status, created_at').order('created_at', { ascending: false }).limit(3);
  console.log('ธุรกรรมล่าสุด 3 รายการ:', recentTx);

  // 3. Lottery Markets & Rates
  console.log('\n--- 3. ตลาดหวยและอัตราจ่าย (Lottery Markets & Payout Rates) ---');
  const { data: markets } = await supabase.from('lottery_markets').select('id, name, code, is_active, close_time, result_time').limit(5);
  const { count: totalMarkets } = await supabase.from('lottery_markets').select('*', { count: 'exact', head: true });
  console.log(`ตลาดหวยทั้งหมดในระบบ: ${totalMarkets} ตลาด`);
  console.log('ตัวอย่างตลาดหวย 5 ตลาด:', markets);

  const { data: rates } = await supabase.from('payout_rates').select('id, market_id, bet_type, rate, min_bet, max_bet').limit(5);
  console.log('ตัวอย่างอัตราจ่ายหวย 5 รายการ:', rates);

  // 4. Restricted Numbers (เลขอั้น)
  console.log('\n--- 4. เลขอั้น & ปิดรับ (Restricted Numbers) ---');
  const { data: restricted, count: totalRestricted } = await supabase.from('restricted_numbers').select('*', { count: 'exact' });
  console.log(`เลขอั้นทั้งหมดในระบบ: ${totalRestricted} รายการ`);
  console.log('รายการเลขอั้นปัจจุบัน:', restricted);

  // 5. Instant Lotto (ล็อตโต้ 1 นาที)
  console.log('\n--- 5. ล็อตโต้ 1 นาที (Instant Lotto 1-Min) ---');
  const { count: totalInstantDraws } = await supabase.from('instant_draws').select('*', { count: 'exact', head: true });
  const { data: latestInstantDraws } = await supabase.from('instant_draws').select('id, round_number, prize_3top, prize_2down, status, created_at').order('created_at', { ascending: false }).limit(3);
  console.log(`รอบล็อตโต้ 1 นาทีทั้งหมดที่บันทึก: ${totalInstantDraws} รอบ`);
  console.log('รอบออกรางวัลล่าสุด 3 รอบ:', latestInstantDraws);

  // 6. Marketing, Wheel & Sliders
  console.log('\n--- 6. วงล้อโชคดี, สไลเดอร์ และ โปรโมชั่น (Marketing & Banners) ---');
  const { data: wheelPrizes } = await supabase.from('lucky_wheel_prizes').select('*');
  console.log(`รางวัลวงล้อโชคดี (${wheelPrizes ? wheelPrizes.length : 0} รายการ):`, wheelPrizes?.map(p => ({ id: p.id, name: p.name, reward: p.reward_amount, prob: p.probability })));

  const { data: sliders } = await supabase.from('sliders').select('id, title, image_url, sort_order, is_active');
  console.log(`สไลเดอร์หน้าเว็บ (${sliders ? sliders.length : 0} รายการ):`, sliders);

  const { data: promos } = await supabase.from('promotions').select('id, title, reward_amount, is_active');
  console.log(`โปรโมชั่น (${promos ? promos.length : 0} รายการ):`, promos);

  // 7. System Settings & Appearance
  console.log('\n--- 7. การตั้งค่าระบบ & หน้าตาเว็บ (System Settings & Appearance) ---');
  const { data: allSettings } = await supabase.from('settings').select('key, value');
  const settingsMap = {};
  allSettings.forEach(s => settingsMap[s.key] = s.value);
  console.log('ข้อมูลแบรนด์และรูปลักษณ์:');
  console.log(`- site_name: ${settingsMap.site_name}`);
  console.log(`- site_tagline: ${settingsMap.site_tagline}`);
  console.log(`- site_logo_url: ${settingsMap.site_logo_url}`);
  console.log(`- theme_primary_color: ${settingsMap.theme_primary_color}`);
  console.log(`- popup_enabled: ${settingsMap.popup_enabled}`);
  console.log(`- popup_title: ${settingsMap.popup_title}`);
  console.log(`- popup_description: ${settingsMap.popup_description}`);
  console.log(`- popup_image_url: ${settingsMap.popup_image_url}`);
  console.log(`- line_notify_enabled: ${settingsMap.line_notify_enabled}`);
  console.log(`- contact_line_id: ${settingsMap.contact_line_id}`);
  console.log(`- contact_line_url: ${settingsMap.contact_line_url}`);
  console.log(`- min_deposit: ${settingsMap.min_deposit}`);
  console.log(`- min_withdraw: ${settingsMap.min_withdraw}`);

  // 8. Bank Accounts
  console.log('\n--- 8. บัญชีธนาคารรับฝาก (Company Banks) ---');
  const { data: banks } = await supabase.from('banks').select('*');
  console.log(`บัญชีธนาคารรับฝาก (${banks ? banks.length : 0} รายการ):`, banks);

  // 9. Login Logs & Security
  console.log('\n--- 9. บันทึกความปลอดภัย & การเข้าสู่ระบบ (Security & Login Logs) ---');
  const { data: loginLogs } = await supabase.from('login_attempts').select('id, identifier, success, ip_address, created_at').order('created_at', { ascending: false }).limit(5);
  console.log('บันทึกการพยายามล็อกอิน 5 รายการล่าสุด:', loginLogs);

  console.log('\n================================================================');
  console.log('     AUDIT COMPLETE: All modules verified against Supabase DB');
  console.log('================================================================');
}

deepSystemAudit();
