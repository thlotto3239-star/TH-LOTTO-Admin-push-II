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

async function testDepositFlow() {
  console.log('--- TESTING FULL DEPOSIT FLOW & RPCS ---');
  // 1. Get a test member
  const { data: member } = await supabase.from('profiles').select('id, full_name').eq('is_admin', false).limit(1).single();
  console.log('Test Member:', member);

  // 2. Check balance before
  const { data: wBefore } = await supabase.from('wallets').select('balance').eq('user_id', member.id).single();
  console.log('Balance before deposit:', wBefore.balance);

  // 3. Insert deposit request
  const { data: depReq, error: depErr } = await supabase.from('deposit_requests').insert({
    user_id: member.id,
    amount: 250,
    status: 'PENDING',
    slip_url: 'https://test-slip.jpg',
    created_at: new Date().toISOString()
  }).select().single();

  if (depErr) {
    console.error('Insert deposit_requests failed:', depErr);
    return;
  }
  console.log('Created deposit request ID:', depReq.id);

  // 4. Test admin_service_approve_deposit RPC
  const { data: appRes, error: appErr } = await supabase.rpc('admin_service_approve_deposit', {
    p_request_id: depReq.id,
    p_admin_note: 'Test Approval'
  });

  if (appErr) {
    console.error('RPC admin_service_approve_deposit failed:', appErr);
  } else {
    console.log('RPC admin_service_approve_deposit succeeded:', appRes);
    const { data: wAfter } = await supabase.from('wallets').select('balance').eq('user_id', member.id).single();
    console.log('Balance after deposit approved:', wAfter.balance);

    // Revert balance to clean up
    await supabase.rpc('admin_service_adjust_wallet', {
      p_user_id: member.id,
      p_delta: -250,
      p_note: 'CLEANUP DEPOSIT TEST'
    });
  }

  // 5. Clean up deposit request
  await supabase.from('deposit_requests').delete().eq('id', depReq.id);
  console.log('--- TEST FINISHED ---');
}

testDepositFlow();
