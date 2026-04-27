import { Pool } from 'pg';

async function testConnection() {
  const conn = "postgresql://postgres.itktelunooqgjglbhvmk:HIOiiHbgRWaalLt6@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
  
  console.log(`Testing Corrected Pooler...`);
  const pool = new Pool({ connectionString: conn, connectionTimeoutMillis: 5000 });
  try {
    const res = await pool.query('SELECT COUNT(*) FROM "User"');
    console.log(`  ✅ SUCCESS! Users count: ${res.rows[0].count}`);
  } catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
  } finally {
    await pool.end();
  }
}

testConnection();
