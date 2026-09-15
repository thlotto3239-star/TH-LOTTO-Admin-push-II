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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  console.log('--- STORAGE BUCKETS ---');
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('Buckets:', buckets?.map(b => b.name) || bErr);

  console.log('\n--- DEPOSIT REQUESTS COLUMNS INSPECT ---');
  const { data: dIns, error: dInsErr } = await supabase.from('deposit_requests').insert({
    user_id: '98fb9b29-0915-494e-9e43-8844771fc784',
    amount: 100,
    status: 'PENDING'
  }).select();
  if (dIns && dIns.length > 0) {
    console.log('deposit_requests columns:', Object.keys(dIns[0]).join(', '));
    await supabase.from('deposit_requests').delete().eq('id', dIns[0].id);
  } else {
    console.log('deposit_requests insert error:', dInsErr);
  }

  console.log('\n--- WITHDRAW REQUESTS COLUMNS INSPECT ---');
  const { data: wIns, error: wInsErr } = await supabase.from('withdraw_requests').insert({
    user_id: '98fb9b29-0915-494e-9e43-8844771fc784',
    amount: 100,
    status: 'PENDING'
  }).select();
  if (wIns && wIns.length > 0) {
    console.log('withdraw_requests columns:', Object.keys(wIns[0]).join(', '));
    await supabase.from('withdraw_requests').delete().eq('id', wIns[0].id);
  } else {
    console.log('withdraw_requests insert error:', wInsErr);
  }
}

check();
