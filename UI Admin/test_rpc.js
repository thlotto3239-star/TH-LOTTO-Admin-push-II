const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ygopnjbvccenryejqmlw.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('Testing...');
