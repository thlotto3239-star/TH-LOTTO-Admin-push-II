const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx !== -1) {
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testWithdrawFlow() {
  console.log('--- TESTING FULL WITHDRAW FLOW & RPCS ---');
  // 1. Get a test member
  const { data: member } = await supabase.from('profiles').select('id, full_name, bank_name, bank_account_number, bank_account_name').eq('is_admin', false).limit(1).single();
  console.log('Test Member:', member);

  // 2. Check balance before
  const { data: wBefore } = await supabase.from('wallets').select('balance').eq('user_id', member.id).single();
  console.log('Balance before withdraw request:', wBefore.balance);

  // 3. Insert withdraw request (simulating user requesting withdrawal)
  const { data: withReq, error: withErr } = await supabase.from('withdraw_requests').insert({
    user_id: member.id,
    amount: 150,
    status: 'PENDING',
    bank_name: member.bank_name || 'KBANK',
    bank_account_number: member.bank_account_number || '1234567890',
    bank_account_name: member.bank_account_name || member.full_name,
    created_at: new Date().toISOString()
  }).select().single();

  if (withErr) {
    console.error('Insert withdraw_requests failed:', withErr);
    return;
  }
  console.log('Created withdraw request ID:', withReq.id);

  // 4. Test admin_service_approve_withdraw RPC
  const { data: appRes, error: appErr } = await supabase.rpc('admin_service_approve_withdraw', {
    p_request_id: withReq.id,
    p_admin_note: 'Test Withdraw Approval'
  });

  if (appErr) {
    console.error('RPC admin_service_approve_withdraw failed:', appErr);
  } else {
    console.log('RPC admin_service_approve_withdraw succeeded:', appRes);
    const { data: wAfter } = await supabase.from('wallets').select('balance').eq('user_id', member.id).single();
    console.log('Balance after withdraw approved:', wAfter.balance);

    // Revert balance to clean up
    await supabase.rpc('admin_service_adjust_wallet', {
      p_user_id: member.id,
      p_delta: 150,
      p_note: 'CLEANUP WITHDRAW TEST'
    });
  }

  // 5. Clean up withdraw request
  await supabase.from('withdraw_requests').delete().eq('id', withReq.id);
  console.log('--- WITHDRAW TEST FINISHED ---');
}

testWithdrawFlow();
