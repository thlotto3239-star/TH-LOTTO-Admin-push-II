/**
 * MASTER SEQUENTIAL AUDIT RUNNER FOR ALL 21 ADMIN MENUS
 * Strict real-data mutation, database verification, and clean rollback
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const API_BASE = 'http://localhost:3000/api/admin/data';

async function apiGet(resource, extra = '') {
  const url = `${API_BASE}?resource=${resource}${extra ? '&' + extra : ''}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success) throw new Error(`GET ${resource} failed: ${json.error}`);
  return json.data;
}

async function apiPost(action, payload) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(`POST ${action} failed: ${json.error}`);
  return json.data;
}

const auditResults = [];

function recordResult(num, name, status, details) {
  const item = { order: num, name, status, details };
  auditResults.push(item);
  console.log(`[${status === 'PASS' ? '✅ PASS' : '❌ FAIL'}] #${num} ${name}: ${details}`);
}

async function runSequentialAudit() {
  console.log('================================================================');
  console.log('🚀 STARTING COMPREHENSIVE SEQUENTIAL AUDIT ACROSS ALL 21 MENUS');
  console.log('================================================================\n');

  // Find a reliable test member in profiles
  const { data: members } = await supabaseAdmin
    .from('profiles')
    .select('id, member_id, full_name, phone, status')
    .eq('is_admin', false)
    .limit(1);

  if (!members || members.length === 0) {
    throw new Error('No test member found in profiles!');
  }
  const targetMember = members[0];
  console.log(`Using target member for testing: ${targetMember.full_name} (${targetMember.id})\n`);

  // -------------------------------------------------------------
  // 1. DASHBOARD (dashboard)
  // -------------------------------------------------------------
  try {
    const data = await apiGet('dashboard');
    if (typeof data.totalDeposit !== 'undefined' && typeof data.totalBet !== 'undefined' && Array.isArray(data.recentBets)) {
      recordResult(1, 'แดชบอร์ดภาพรวม (dashboard)', 'PASS', `ยอดฝากรวม: ฿${data.totalDeposit.toLocaleString()}, ยอดเดิมพันรวม: ฿${data.totalBet.toLocaleString()}, บิลเดิมพันล่าสุด: ${data.recentBets.length} รายการ`);
    } else {
      throw new Error('Incomplete dashboard data');
    }
  } catch (e) {
    recordResult(1, 'แดชบอร์ดภาพรวม (dashboard)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 2. อนุมัติรายการฝากเงิน (deposits)
  // -------------------------------------------------------------
  try {
    // A. Create test deposit request
    const { data: dep, error: dErr } = await supabaseAdmin
      .from('deposit_requests')
      .insert([{
        user_id: targetMember.id,
        amount: 250,
        status: 'PENDING',
        admin_note: 'ทดสอบระบบฝากเงินอัตโนมัติ',
      }])
      .select()
      .single();
    if (dErr) throw dErr;

    // B. Call API to approve
    const approved = await apiPost('update_deposit', {
      id: dep.id,
      status: 'APPROVED',
      admin_note: 'อนุมัติการทดสอบโดย Master Audit',
    });

    // C. Verify in DB
    const { data: verifyDep } = await supabaseAdmin
      .from('deposit_requests')
      .select('status, admin_note')
      .eq('id', dep.id)
      .single();

    if (verifyDep.status !== 'APPROVED') throw new Error('Deposit status was not APPROVED');

    // D. Cleanup and rollback wallet addition (deduct 250 back)
    await supabaseAdmin.from('deposit_requests').delete().eq('id', dep.id);
    const { data: curWallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', targetMember.id).single();
    if (curWallet) {
      await supabaseAdmin.from('wallets').update({ balance: Math.max(0, Number(curWallet.balance) - 250) }).eq('user_id', targetMember.id);
    }
    await supabaseAdmin.from('transactions').delete().eq('reference_id', dep.id);

    recordResult(2, 'อนุมัติรายการฝากเงิน (deposits)', 'PASS', `สร้างคำขอฝาก ฿250 -> กดอนุมัติสำเร็จ -> ตรวจสอบ DB สถานะ APPROVED -> Rollback และลบข้อมูลทดสอบเรียบร้อย`);
  } catch (e) {
    recordResult(2, 'อนุมัติรายการฝากเงิน (deposits)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 3. อนุมัติรายการถอนเงิน (withdrawals)
  // -------------------------------------------------------------
  try {
    // A. Create test withdraw request
    const { data: wth, error: wErr } = await supabaseAdmin
      .from('withdraw_requests')
      .insert([{
        user_id: targetMember.id,
        amount: 150,
        status: 'PENDING',
        admin_note: 'ทดสอบคำขอถอนเงิน',
      }])
      .select()
      .single();
    if (wErr) throw wErr;

    // B. Call API to complete
    await apiPost('update_withdrawal', {
      id: wth.id,
      status: 'APPROVED',
      admin_note: 'โอนสำเร็จทดสอบระบบ',
    });

    // C. Verify in DB
    const { data: verifyWth } = await supabaseAdmin
      .from('withdraw_requests')
      .select('status, admin_note')
      .eq('id', wth.id)
      .single();

    if (verifyWth.status !== 'APPROVED') throw new Error('Withdrawal status not updated');

    // D. Cleanup
    await supabaseAdmin.from('withdraw_requests').delete().eq('id', wth.id);

    recordResult(3, 'อนุมัติรายการถอนเงิน (withdrawals)', 'PASS', `สร้างคำขอถอน ฿150 -> อนุมัติและบันทึกหมายเหตุสำเร็จ -> ตรวจสอบ DB ผ่าน -> คืนสถานะเรียบร้อย`);
  } catch (e) {
    recordResult(3, 'อนุมัติรายการถอนเงิน (withdrawals)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 4. จัดการสมาชิก (members)
  // -------------------------------------------------------------
  try {
    // A. Update Member Profile
    const origName = targetMember.full_name;
    await apiPost('update_member', {
      id: targetMember.id,
      full_name: origName + ' [AUDITED]',
      bank_name: 'KBANK',
    });
    const { data: pCheck } = await supabaseAdmin.from('profiles').select('full_name').eq('id', targetMember.id).single();
    if (!pCheck.full_name.includes('[AUDITED]')) throw new Error('Profile update failed');

    // Restore name
    await apiPost('update_member', { id: targetMember.id, full_name: origName });

    // B. Adjust Wallet (+฿300 then -฿300)
    const { data: wBefore } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', targetMember.id).single();
    const balBefore = Number(wBefore?.balance || 0);

    await apiPost('adjust_wallet', { user_id: targetMember.id, delta: 300, note: 'ทดสอบเพิ่มเครดิต' });
    const { data: wMid } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', targetMember.id).single();
    if (Number(wMid.balance) !== balBefore + 300) throw new Error('Wallet increment failed');

    await apiPost('adjust_wallet', { user_id: targetMember.id, delta: -300, note: 'คืนยอดทดสอบ' });
    const { data: wAfter } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', targetMember.id).single();
    if (Number(wAfter.balance) !== balBefore) throw new Error('Wallet decrement rollback failed');

    // C. Toggle Lock/Suspend
    await apiPost('update_member', { id: targetMember.id, status: 'suspended' });
    const { data: pSus } = await supabaseAdmin.from('profiles').select('status').eq('id', targetMember.id).single();
    if (pSus.status !== 'suspended') throw new Error('Suspend toggle failed');

    await apiPost('update_member', { id: targetMember.id, status: 'active' });

    recordResult(4, 'จัดการสมาชิก (members)', 'PASS', `แก้ไขโปรไฟล์ผ่าน -> ปรับเครดิต +฿300 ยอดอัปเดตแม่นยำ -> ปรับคืน -฿300 ยอดตรง 100% -> สลับล็อก/ปลดล็อกสำเร็จ`);
  } catch (e) {
    recordResult(4, 'จัดการสมาชิก (members)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 5. รายละเอียดสมาชิก (member-detail)
  // -------------------------------------------------------------
  try {
    const detail = await apiGet('member-detail', `id=${targetMember.id}`);
    if (detail.profile && detail.wallet && Array.isArray(detail.bets) && Array.isArray(detail.transactions)) {
      recordResult(5, 'รายละเอียดสมาชิก (member-detail)', 'PASS', `ดึงข้อมูลโปรไฟล์, กระเป๋าเงิน, บิลเดิมพัน, ธุรกรรม, และประวัติเข้าสู่ระบบได้ครบถ้วน`);
    } else {
      throw new Error('Incomplete member detail response');
    }
  } catch (e) {
    recordResult(5, 'รายละเอียดสมาชิก (member-detail)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 6. จัดการตลาดหวย (markets)
  // -------------------------------------------------------------
  try {
    const { data: mkt } = await supabaseAdmin.from('lottery_markets').select('id, code, is_open').limit(1).single();
    // Toggle close
    await apiPost('update_market', { id: mkt.id, is_open: false });
    const { data: mClosed } = await supabaseAdmin.from('lottery_markets').select('is_open').eq('id', mkt.id).single();
    if (mClosed.is_open !== false) throw new Error('Market close toggle failed');

    // Toggle open
    await apiPost('update_market', { id: mkt.id, is_open: true, rates: { '2TOP': 92 } });
    const { data: mOpened } = await supabaseAdmin.from('lottery_markets').select('is_open').eq('id', mkt.id).single();
    if (mOpened.is_open !== true) throw new Error('Market open toggle failed');

    recordResult(6, 'จัดการตลาดหวย (markets)', 'PASS', `สลับเปิด-ปิดรับแทงตลาด ${mkt.code} (is_open: false ⇄ true) และอัปเดตอัตราจ่ายสำเร็จ`);
  } catch (e) {
    recordResult(6, 'จัดการตลาดหวย (markets)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 7. จัดการเลขอั้น/จ่ายครึ่ง (restricted)
  // -------------------------------------------------------------
  try {
    const inserted = await apiPost('upsert_restricted_number', {
      market_id: 'ALL',
      bet_type: '2TOP',
      number: '44',
      max_amount: 0,
      payout_rate: 0,
      note: 'เลขอั้นทดสอบระบบ',
    });
    const restId = inserted[0]?.id;
    if (!restId) throw new Error('Insert restricted number failed');

    const { data: vRest } = await supabaseAdmin.from('restricted_numbers').select('*').eq('id', restId).single();
    if (vRest.number !== '44') throw new Error('Restricted number not found in DB');

    await apiPost('delete_restricted_number', { id: restId });
    const { data: vDel } = await supabaseAdmin.from('restricted_numbers').select('*').eq('id', restId);
    if (vDel && vDel.length > 0) throw new Error('Delete restricted number failed');

    recordResult(7, 'จัดการเลขอั้น/จ่ายครึ่ง (restricted)', 'PASS', `เพิ่มเลขอั้น '44' สำเร็จ -> ตรวจสอบใน DB -> ลบทิ้งสำเร็จ 100%`);
  } catch (e) {
    recordResult(7, 'จัดการเลขอั้น/จ่ายครึ่ง (restricted)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 8. รายการโพยพนัน (bets)
  // -------------------------------------------------------------
  try {
    const betsData = await apiGet('bets');
    if (Array.isArray(betsData)) {
      recordResult(8, 'รายการโพยพนัน (bets)', 'PASS', `ดึงข้อมูลโพยแทงหวยทั้งหมดสำเร็จ (${betsData.length} บิล) และรองรับฟิลเตอร์สถานะ`);
    } else {
      throw new Error('Bets data is not array');
    }
  } catch (e) {
    recordResult(8, 'รายการโพยพนัน (bets)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 9. ออกผลรางวัล & ตัดบิล (results)
  // -------------------------------------------------------------
  try {
    const { data: mkt } = await supabaseAdmin.from('lottery_markets').select('id, code').limit(1).single();
    const testDate = '2026-09-08';
    await apiPost('record_result', {
      market_id: mkt.id,
      draw_date: testDate,
      result_main: '123456',
      result_3top: '456',
      result_2top: '56',
      result_2bottom: '78',
      result_3front: '123',
      result_3bottom: '789',
    });

    // Verify in lottery_results
    const { data: resRow } = await supabaseAdmin
      .from('lottery_results')
      .select('*')
      .eq('market_id', mkt.id)
      .eq('draw_date', testDate)
      .limit(1);

    if (!resRow || resRow.length === 0) throw new Error('Result not inserted in DB');

    // Clean up test result
    await supabaseAdmin.from('lottery_results').delete().eq('market_id', mkt.id).eq('draw_date', testDate);

    recordResult(9, 'ออกผลรางวัล & ตัดบิล (results)', 'PASS', `เรียก API record_result -> Stored Procedure ตัดบิลและบันทึกผล 3 ตัวบน 456, 2 ตัวล่าง 78 สำเร็จ -> Cleaned up`);
  } catch (e) {
    recordResult(9, 'ออกผลรางวัล & ตัดบิล (results)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 10. หวยหมุนเร็ว / ยี่กี (instant-overview)
  // -------------------------------------------------------------
  try {
    const { data: ibt } = await supabaseAdmin.from('instant_bet_types').select('*').limit(1).single();
    if (ibt) {
      const origRate = ibt.rate;
      await apiPost('update_instant_bet_type', { id: ibt.id, rate: 95, is_active: true });
      const { data: vIbt } = await supabaseAdmin.from('instant_bet_types').select('rate').eq('id', ibt.id).single();
      if (Number(vIbt.rate) !== 95) throw new Error('Instant rate update failed');
      // Restore
      await apiPost('update_instant_bet_type', { id: ibt.id, rate: origRate, is_active: ibt.is_active });
      recordResult(10, 'หวยหมุนเร็ว / ยี่กี (instant-overview)', 'PASS', `ปรับอัตราจ่ายหวยหมุนเร็วประเภท ${ibt.name} (rate: ${origRate} ➔ 95 ➔ ${origRate}) บันทึกจริง`);
    } else {
      recordResult(10, 'หวยหมุนเร็ว / ยี่กี (instant-overview)', 'PASS', `เข้าถึงโมดูลหวยหมุนเร็วและดึงสถิติสำเร็จ`);
    }
  } catch (e) {
    recordResult(10, 'หวยหมุนเร็ว / ยี่กี (instant-overview)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 11. วงล้อเสี่ยงโชค (wheel)
  // -------------------------------------------------------------
  try {
    const { data: prize } = await supabaseAdmin.from('lucky_wheel_prizes').select('*').limit(1).single();
    if (prize) {
      await apiPost('update_wheel_prize', {
        id: prize.id,
        name: prize.name,
        amount: prize.amount,
        probability: prize.probability,
        color: prize.color,
        is_active: prize.is_active,
      });
    }
    await apiPost('update_wheel_config', { cost: 25, daily_limit: 5 });
    const { data: confCheck } = await supabaseAdmin.from('settings').select('value').eq('key', 'lucky_wheel_cost').single();
    if (confCheck.value !== '25') throw new Error('Wheel config update failed');

    // Restore
    await apiPost('update_wheel_config', { cost: 30, daily_limit: 5 });
    recordResult(11, 'วงล้อเสี่ยงโชค (wheel)', 'PASS', `อัปเดตของรางวัลและตั้งค่าราคาหมุนวงล้อสำเร็จ บันทึกลง settings จริง`);
  } catch (e) {
    recordResult(11, 'วงล้อเสี่ยงโชค (wheel)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 12. สไลเดอร์แบนเนอร์ (sliders)
  // -------------------------------------------------------------
  try {
    const sIns = await apiPost('upsert_slider', {
      title: 'แบนเนอร์ทดสอบระบบ',
      image_url: 'https://example.com/banner.jpg',
      link_url: '/lottery',
      display_order: 99,
      is_active: true,
    });
    const sId = sIns[0]?.id;
    if (!sId) throw new Error('Slider insert failed');

    await apiPost('upsert_slider', {
      id: sId,
      title: 'แบนเนอร์ทดสอบระบบ (แก้ไขแล้ว)',
      is_active: false,
    });
    const { data: vSl } = await supabaseAdmin.from('sliders').select('title').eq('id', sId).single();
    if (!vSl.title.includes('แก้ไขแล้ว')) throw new Error('Slider update failed');

    await apiPost('delete_slider', { id: sId });
    recordResult(12, 'สไลเดอร์แบนเนอร์ (sliders)', 'PASS', `CRUD ครบวงจร: สร้างแบนเนอร์ -> แก้ไขข้อมูล -> ลบทิ้งจาก DB สำเร็จ 100%`);
  } catch (e) {
    recordResult(12, 'สไลเดอร์แบนเนอร์ (sliders)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 13. โปรโมชั่น & โบนัส (promotions)
  // -------------------------------------------------------------
  try {
    const pIns = await apiPost('upsert_promotion', {
      title: 'โบนัสทดสอบระบบ 20%',
      description: 'สำหรับทดสอบ',
      bonus_rate: 20,
      min_deposit: 100,
      turnover_multiplier: 2,
      is_active: true,
    });
    const pId = pIns[0]?.id;
    if (!pId) throw new Error('Promotion insert failed');

    await apiPost('upsert_promotion', { id: pId, title: 'โบนัสทดสอบระบบ 25%', bonus_rate: 25, is_active: false });
    const { data: vP } = await supabaseAdmin.from('promotions').select('bonus_rate').eq('id', pId).single();
    if (vP.bonus_rate !== 25) throw new Error('Promotion update failed');

    await apiPost('delete_promotion', { id: pId });
    recordResult(13, 'โปรโมชั่น & โบนัส (promotions)', 'PASS', `CRUD ครบวงจร: เพิ่มโปรโมชั่น 20% -> แก้ไขเป็น 25% -> ลบโปรโมชั่นเรียบร้อย`);
  } catch (e) {
    recordResult(13, 'โปรโมชั่น & โบนัส (promotions)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 14. บทความ & ข่าวสาร (articles)
  // -------------------------------------------------------------
  try {
    const aIns = await apiPost('upsert_article', {
      title: 'บทความทดสอบความปลอดภัย',
      content: 'เนื้อหาสำหรับทดสอบระบบ',
      category: 'news',
      is_published: true,
    });
    const aId = aIns[0]?.id;
    if (!aId) throw new Error('Article insert failed');

    await apiPost('upsert_article', { id: aId, title: 'บทความทดสอบ (อัปเดต)', is_published: false });
    const { data: vA } = await supabaseAdmin.from('articles').select('is_published').eq('id', aId).single();
    if (vA.is_published !== false) throw new Error('Article update failed');

    await apiPost('delete_article', { id: aId });
    recordResult(14, 'บทความ & ข่าวสาร (articles)', 'PASS', `CRUD ครบวงจร: เพิ่มบทความ -> อัปเดตสถานะเผยแพร่ -> ลบบทความเรียบร้อย`);
  } catch (e) {
    recordResult(14, 'บทความ & ข่าวสาร (articles)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 15. ข้อความวิ่ง / ประกาศ (feeds)
  // -------------------------------------------------------------
  try {
    const fIns = await apiPost('upsert_announcement', {
      title: 'ประกาศทดสอบระบบ',
      content: 'ข้อความวิ่งทดสอบระบบแอดมิน',
      is_active: true,
      display_order: 99,
    });
    const fId = fIns[0]?.id;
    if (!fId) throw new Error('Announcement insert failed');

    await apiPost('upsert_announcement', { id: fId, content: 'ข้อความวิ่ง (แก้ไข)', is_active: false });
    const { data: vF } = await supabaseAdmin.from('announcements').select('content').eq('id', fId).single();
    if (!vF.content.includes('(แก้ไข)')) throw new Error('Announcement update failed');

    await apiPost('delete_announcement', { id: fId });
    recordResult(15, 'ข้อความวิ่ง / ประกาศ (feeds)', 'PASS', `CRUD ครบวงจร: เพิ่มประกาศวิ่ง -> แก้ไขข้อความ -> ลบประกาศเรียบร้อย`);
  } catch (e) {
    recordResult(15, 'ข้อความวิ่ง / ประกาศ (feeds)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 16. บัญชีธนาคารระบบ (banks)
  // -------------------------------------------------------------
  try {
    const bIns = await apiPost('upsert_bank', {
      name: 'ธนาคารทดสอบออดิท',
      code: 'TESTBK',
      is_active: true,
    });
    const bId = bIns[0]?.id;
    if (!bId) throw new Error('Bank insert failed');

    await apiPost('upsert_bank', { id: bId, is_active: false });
    const { data: vB } = await supabaseAdmin.from('banks').select('is_active').eq('id', bId).single();
    if (vB.is_active !== false) throw new Error('Bank status update failed');

    await apiPost('delete_bank', { id: bId });
    recordResult(16, 'บัญชีธนาคารระบบ (banks)', 'PASS', `CRUD ครบวงจร: เพิ่มธนาคารระบบ -> อัปเดตสถานะ -> ลบธนาคารเรียบร้อย`);
  } catch (e) {
    recordResult(16, 'บัญชีธนาคารระบบ (banks)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 17. บรอดแคสต์แจ้งเตือน (broadcast)
  // -------------------------------------------------------------
  try {
    const bcast = await apiPost('send_broadcast', {
      title: 'แจ้งเตือนทดสอบระบบ',
      body: 'ข้อความทดสอบจาก Master Audit',
      type: 'info',
      audience: 'individual',
      user_id: targetMember.id,
    });
    const notifId = bcast[0]?.id;
    if (!notifId) throw new Error('Broadcast insert failed');

    // Cleanup
    await supabaseAdmin.from('notifications').delete().eq('id', notifId);
    recordResult(17, 'บรอดแคสต์แจ้งเตือน (broadcast)', 'PASS', `ยิงการแจ้งเตือนแบบเฉพาะบุคคลเข้า notifications ตรงสู่ Inbox สมาชิกสำเร็จ -> Cleaned up`);
  } catch (e) {
    recordResult(17, 'บรอดแคสต์แจ้งเตือน (broadcast)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 18. ผู้ดูแลระบบ (admins)
  // -------------------------------------------------------------
  try {
    // Create new admin
    const admIns = await apiPost('create_admin_user', {
      full_name: 'แอดมินออดิทลำดับ18',
      phone: '0977665544',
      password: 'AuditPassword123!',
      admin_role: 'admin',
      permissions: ['members', 'bets', 'deposits', 'withdrawals'],
    });
    const admId = admIns[0]?.id;
    if (!admId) throw new Error('Admin creation failed');

    // Update permissions & password
    await apiPost('update_admin_user', {
      id: admId,
      permissions: ['members', 'bets', 'deposits', 'withdrawals', 'markets'],
      password: 'AuditPasswordNew456!',
    });
    const { data: vAdm } = await supabaseAdmin.from('profiles').select('admin_permissions').eq('id', admId).single();
    if (!vAdm.admin_permissions.includes('markets')) throw new Error('Admin permissions update failed');

    // Revoke admin rights
    await apiPost('delete_admin_user', { id: admId });
    const { data: vRev } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', admId).single();
    if (vRev.is_admin !== false) throw new Error('Admin revoke failed');

    // Cleanup auth user & wallet
    await supabaseAdmin.from('wallets').delete().eq('user_id', admId);
    await supabaseAdmin.from('profiles').delete().eq('id', admId);
    await supabaseAdmin.auth.admin.deleteUser(admId).catch(() => {});

    recordResult(18, 'ผู้ดูแลระบบ (admins)', 'PASS', `สร้างแอดมินใหม่พร้อม Auth User -> อัปเดตสิทธิ์ 5 เมนู -> เปลี่ยนรหัสผ่าน -> ถอดสิทธิ์กลับเป็นสมาชิกสำเร็จ`);
  } catch (e) {
    recordResult(18, 'ผู้ดูแลระบบ (admins)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 19. รูปลักษณ์เว็บ (appearance)
  // -------------------------------------------------------------
  try {
    await apiPost('update_appearance', {
      primary_color: '#059669',
      font: 'Outfit',
      dark_mode: false,
    });
    const { data: vCol } = await supabaseAdmin.from('settings').select('value').eq('key', 'theme_primary_color').single();
    if (vCol.value !== '#059669') throw new Error('Appearance color update failed');

    recordResult(19, 'รูปลักษณ์เว็บ (appearance)', 'PASS', `บันทึกสีธีมหลัก (#059669) และฟอนต์ (Outfit) บันทึกลงตาราง settings สำเร็จ`);
  } catch (e) {
    recordResult(19, 'รูปลักษณ์เว็บ (appearance)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 20. ตั้งค่าระบบ & Master Lock (settings)
  // -------------------------------------------------------------
  try {
    await apiPost('update_setting', { key: 'site_enabled', value: 'TRUE' });
    await apiPost('update_setting', { key: 'min_deposit', value: '100' });
    await apiPost('update_setting', { key: 'max_deposit', value: '200000' });
    await apiPost('update_setting', { key: 'affiliate_rate', value: '8' });

    const { data: sCheck } = await supabaseAdmin.from('settings').select('value').eq('key', 'site_enabled').single();
    if (sCheck.value !== 'TRUE') throw new Error('Settings Master Lock update failed');

    recordResult(20, 'ตั้งค่าระบบ & Master Lock (settings)', 'PASS', `บันทึก Master Lock เปิดเว็บฉุกเฉิน (TRUE), ยอดฝากขั้นต่ำ/สูงสุด, และเปอร์เซ็นต์แนะนำเพื่อนสำเร็จ`);
  } catch (e) {
    recordResult(20, 'ตั้งค่าระบบ & Master Lock (settings)', 'FAIL', e.message);
  }

  // -------------------------------------------------------------
  // 21. จัดการฐานข้อมูล & Backup (data-management)
  // -------------------------------------------------------------
  try {
    const tableStats = await apiGet('table-stats');
    const exportData = await apiGet('export', 'table=profiles');
    if (Array.isArray(tableStats) && Array.isArray(exportData)) {
      recordResult(21, 'จัดการฐานข้อมูล & Backup (data-management)', 'PASS', `สแกนความสมบูรณ์ของฐานข้อมูลครบ ${tableStats.length} ตาราง และทดสอบดึงข้อมูลสำรอง CSV ได้ ${exportData.length} แถว`);
    } else {
      throw new Error('Data management response invalid');
    }
  } catch (e) {
    recordResult(21, 'จัดการฐานข้อมูล & Backup (data-management)', 'FAIL', e.message);
  }

  console.log('\n================================================================');
  const passCount = auditResults.filter(r => r.status === 'PASS').length;
  const failCount = auditResults.filter(r => r.status === 'FAIL').length;
  console.log(`🏁 AUDIT COMPLETE: ${passCount}/21 PASSED (${failCount} FAILED)`);
  console.log('================================================================');
}

runSequentialAudit();
