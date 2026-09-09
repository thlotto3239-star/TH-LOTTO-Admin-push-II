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

async function inspectAllTables() {
  const tables = [
    'profiles',
    'wallets',
    'transactions',
    'deposit_requests',
    'withdraw_requests',
    'lottery_markets',
    'payout_rates',
    'draw_schedules',
    'lottery_results',
    'bets',
    'restricted_numbers',
    'instant_draws',
    'instant_bet_types',
    'lucky_wheel_prizes',
    'lucky_wheel_spins',
    'sliders',
    'promotions',
    'articles',
    'announcements',
    'banks',
    'settings',
    'admin_roles',
    'admin_notifications',
    'login_attempts'
  ];

  console.log('=== EXACT LIVE DATA SAMPLE FROM ALL 24 SUPABASE TABLES ===\n');

  for (const t of tables) {
    const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' }).limit(2);
    if (error) {
      console.log(`[TABLE: ${t}] ERROR:`, error.message);
    } else {
      console.log(`[TABLE: ${t}] (${count} total rows):`);
      console.log(JSON.stringify(data, null, 2));
      console.log('--------------------------------------------------\n');
    }
  }
}

inspectAllTables();
