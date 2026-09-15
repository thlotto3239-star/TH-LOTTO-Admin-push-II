const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx !== -1) {
    env[line.substring(0, idx).trim()] = line.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Test calling submit_deposit_slip
  const { data: rpcTest1, error: err1 } = await sb.rpc('submit_deposit_slip', {
    p_amount: 100,
    p_slip_url: 'https://example.com/slip.jpg',
  });
  console.log('submit_deposit_slip ({p_amount, p_slip_url}):', { data: rpcTest1, error: err1 });

  // Let's inspect PostgreSQL information_schema for functions named submit_deposit_slip
  const { data: profileList } = await sb.from('profiles').select('id, member_id, phone').limit(1);
  const testUserId = profileList?.[0]?.id;
  console.log('Sample User ID:', testUserId);

  if (testUserId) {
    const { data: rpcTest2, error: err2 } = await sb.rpc('submit_deposit_slip', {
      p_user_id: testUserId,
      p_amount: 100,
      p_slip_url: 'https://example.com/slip.jpg',
    });
    console.log('submit_deposit_slip with p_user_id:', { data: rpcTest2, error: err2 });
  }
}

main();
