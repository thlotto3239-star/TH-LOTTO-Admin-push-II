const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectColumns() {
  console.log('--- Inspecting Columns of deposit_requests & withdraw_requests ---');
  
  // We can query pg_attribute or try sample select
  const { data: dSample, error: dErr } = await supabase.from('deposit_requests').select('*').limit(1);
  console.log('deposit_requests keys:', dSample ? Object.keys(dSample[0] || {}) : dErr);

  const { data: wSample, error: wErr } = await supabase.from('withdraw_requests').select('*').limit(1);
  console.log('withdraw_requests keys:', wSample ? Object.keys(wSample[0] || {}) : wErr);

  // If empty, let's insert a minimal row and roll back or check via rpc
  if (!wSample || wSample.length === 0) {
    const { data: ins, error: insErr } = await supabase.from('withdraw_requests').insert({
      user_id: '98fb9b29-0915-494e-9e43-8844771fc784',
      amount: 100,
      status: 'PENDING'
    }).select();
    console.log('Minimal withdraw_requests row insert test:', ins, insErr);
    if (ins && ins.length > 0) {
      console.log('withdraw_requests columns:', Object.keys(ins[0]));
      await supabase.from('withdraw_requests').delete().eq('id', ins[0].id);
    }
  }

  if (!dSample || dSample.length === 0) {
    const { data: ins, error: insErr } = await supabase.from('deposit_requests').insert({
      user_id: '98fb9b29-0915-494e-9e43-8844771fc784',
      amount: 100,
      status: 'PENDING'
    }).select();
    console.log('Minimal deposit_requests row insert test:', ins, insErr);
    if (ins && ins.length > 0) {
      console.log('deposit_requests columns:', Object.keys(ins[0]));
      await supabase.from('deposit_requests').delete().eq('id', ins[0].id);
    }
  }
}

inspectColumns();
