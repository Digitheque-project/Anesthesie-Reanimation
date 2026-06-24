const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Ordre de suppression : d'abord les tables qui ont des clés étrangères
const tables = [
  'webhook_notifications',
  'notifications_cpa',
  'items_commande',
  'bons_commande',
  'constantes_per_op',
  'drainages',
  'scores_sccre',
  'sorties_reveil',
  'creneaux_bloc',
  'historique_modifications',
  'premedicaments',
  'vpa',
  'cpa',
  'activites_per_op',
  'protocoles_operatoires',
  'patients',
  'medecins',
  'users'
];

async function clearData() {
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL sur Render');

    for (const table of tables) {
      await client.query(`TRUNCATE TABLE "${table}" CASCADE;`);
      console.log(`✅ Table ${table} vidée`);
    }

    console.log('\n🎉 Toutes les données fictives ont été supprimées.');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await client.end();
  }
}

clearData();
