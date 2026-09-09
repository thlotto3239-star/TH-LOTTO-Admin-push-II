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

async function main() {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('TOTAL SETTINGS ROWS:', data.length);
  console.log('--- ALL POPUP / MODAL / BANNER / APPEARANCE SETTINGS ---');
  data.forEach(row => {
    console.log(`KEY: [${row.key}] -> VALUE: [${row.value}]`);
  });
}

main();
