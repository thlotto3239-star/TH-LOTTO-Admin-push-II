// verify-betting-limits-and-restrictions.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runVerification() {
  console.log('=== START VERIFICATION: BET LIMITS & RESTRICTED NUMBERS ===\n');

  // 1. Verify lottery_markets has the new columns
  console.log('1. Checking lottery_markets columns...');
  const { data: markets, error: mktErr } = await supabase
    .from('lottery_markets')
    .select('id, name, code, min_bet, max_bet, max_per_number')
    .limit(3);

  if (mktErr) {
    console.error('❌ Failed to select lottery_markets:', mktErr);
  } else {
    console.log('✅ lottery_markets query succeeded:');
    console.table(markets);
  }

  // 2. Verify get_markets_with_countdown RPC includes the columns
  console.log('\n2. Testing get_markets_with_countdown() RPC...');
  const { data: countdownMarkets, error: cdErr } = await supabase.rpc('get_markets_with_countdown');
  if (cdErr) {
    console.error('❌ Failed to call get_markets_with_countdown:', cdErr);
  } else {
    const govMarket = countdownMarkets.find(m => m.code === 'TH_GOV' || m.code === 'LAO');
    console.log('✅ get_markets_with_countdown() returned', countdownMarkets.length, 'markets.');
    if (govMarket) {
      console.log('Sample Market (' + govMarket.name + '):', {
        min_bet: govMarket.min_bet,
        max_bet: govMarket.max_bet,
        max_per_number: govMarket.max_per_number
      });
    }
  }

  // 3. Verify restricted_numbers table has active entries
  console.log('\n3. Checking restricted_numbers table...');
  const { data: restrList, error: rErr } = await supabase
    .from('restricted_numbers')
    .select('*')
    .limit(5);

  if (rErr) {
    console.error('❌ Failed to fetch restricted_numbers:', rErr);
  } else {
    console.log('✅ restricted_numbers has', restrList.length, 'entries.');
    console.table(restrList.map(r => ({
      market_id: r.market_id ? r.market_id.substring(0, 8) + '...' : 'ALL',
      bet_type: r.bet_type,
      number: r.number,
      payout_rate: r.payout_rate,
      max_amount: r.max_amount,
      draw_date: r.draw_date,
      note: r.note
    })));
  }

  // 4. Test place_bet_securely RPC enforcement
  console.log('\n4. Testing place_bet_securely RPC security & enforcement...');
  // Find a test user
  const { data: users, error: uErr } = await supabase.from('profiles').select('id, username, balance').limit(1);
  if (users && users.length > 0) {
    const testUser = users[0];
    const targetMarket = countdownMarkets.find(m => m.code === 'TH_GOV');
    if (targetMarket) {
      console.log(`Using market: ${targetMarket.name} (${targetMarket.id})`);

      // Test 4A: Blocked restricted number (e.g. 915)
      console.log('\n--> Test 4A: Attempting to bet on blocked restricted number 915...');
      // To test as authenticated user via RPC with auth.uid(), we can invoke via a user client or direct sql test
      const { data: testBlocked, error: blkErr } = await supabase.rpc('place_bet_securely', {
        p_market_id: targetMarket.id,
        p_bets: [
          { numbers: '915', bet_type: '3TOP', amount: 10, payout_rate: 900 }
        ]
      });

      console.log('Result for blocked number:', testBlocked || blkErr?.message);
    }
  }

  console.log('\n=== VERIFICATION COMPLETED ===');
}

runVerification().catch(console.error);
