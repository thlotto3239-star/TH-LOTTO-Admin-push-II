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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function getProfileSchema() {
  const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'profiles' });
  if (error) {
    console.log('Cannot use rpc get_table_schema, falling back to select 1 row');
    const { data: rowData, error: rowError } = await supabase.from('profiles').select('*').limit(1);
    console.log('Row sample:', JSON.stringify(rowData, null, 2));
  } else {
    console.log('Schema:', JSON.stringify(data, null, 2));
  }
}

getProfileSchema();
