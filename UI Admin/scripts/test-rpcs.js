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
  // Let's query pg_proc to see all RPC definitions in public schema
  // via an RPC or query if available, or test auth login
  const { data: users } = await sb.from('profiles').select('id, phone, username').limit(3);
  console.log('Sample profiles:', users);

  // Let's check deposit_requests table columns
  const { data: depSample, error: depErr } = await sb.from('deposit_requests').select('*').limit(1);
  console.log('deposit_requests sample:', { depSample, depErr });
}

main();
