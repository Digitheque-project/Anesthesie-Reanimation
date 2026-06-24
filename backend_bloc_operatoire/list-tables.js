const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function listTables() {
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL sur Render\n');

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('📋 Tables existantes :');
    res.rows.forEach(row => console.log(' -', row.table_name));
    console.log(`\n✅ Total : ${res.rows.length} tables`);

    await client.end();
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

listTables();
