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

const sbAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const sbAnon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data: userList } = await sbAdmin.auth.admin.listUsers();
  console.log('Total auth users:', userList?.users?.length);
  const sampleUser = userList?.users?.[0];
  console.log('Sample User:', sampleUser?.email, sampleUser?.id);

  // Let's create an authenticated client using admin generateLink or sign in
  if (sampleUser?.id) {
    // Generate an access token for sampleUser
    const { data: sessionData, error: sessionErr } = await sbAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: sampleUser.email,
    });
    console.log('Magic link generated:', sessionData?.properties?.action_link ? 'OK' : sessionErr);

    // Let's also check submit_deposit_slip parameters directly:
    // Can we pass p_amount, p_slip_url, p_promo_code?
    const { data: r1, error: e1 } = await sbAdmin.rpc('submit_deposit_slip', {
      p_amount: 550,
      p_promo_code: null,
      p_slip_url: 'https://storage/test.jpg'
    });
    console.log('submit_deposit_slip admin call:', { r1, e1 });
  }
}

main();
