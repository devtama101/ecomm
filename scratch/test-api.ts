import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testApi() {
  console.log('Testing Supabase API (fetching Users)...');
  const { data, error } = await supabase.from('User').select('*');
  
  if (error) {
    console.error('API Error:', error.message);
  } else {
    console.log('API Success! Users found:', data?.length);
    console.log('User emails:', data?.map(u => u.email));
  }
}

testApi();
