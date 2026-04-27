import { Pool } from 'pg';

async function testConnection() {
  const password = "JpTdwSrVM6jqCGhI";
  const ref = "itktelunooqgjglbhvmk";
  const region = "ap-northeast-1";

  const host = `${region}.pooler.supabase.com`;
  console.log(`Testing ${host}...`);
  const pool = new Pool({ 
    connectionString: `postgresql://postgres.${ref}:${password}@${host}:6543/postgres?pgbouncer=true`,
    connectionTimeoutMillis: 5000 
  });
  try {
    const res = await pool.query('SELECT current_user');
    console.log(`  ✅ SUCCESS!`);
  } catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
  } finally {
    await pool.end();
  }
}

testConnection();
