const { Client } = require('pg');
try {
  require('dotenv').config();
} catch {
  // dotenv est un paquet du backend ; le script sait de toute façon parser lui-même le .env.
}
const fs = require('fs');
const crypto = require('crypto');

// Le .env local porte `DATABASE_URL = ` (vide) avec l'URL sur la ligne suivante sans clé — dotenv
// ne la charge pas. On la retrouve donc en scannant le contenu brut du fichier.
function lireEnv() {
  const raw = fs.readFileSync(`${__dirname}/.env`, 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1');
  }
  if (!env.DATABASE_URL) {
    const url = raw.match(/postgresql:\/\/[^\s]+/);
    if (url) env.DATABASE_URL = url[0];
  }
  return env;
}

function mintServiceToken(secret, serviceId, chuId) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: `service-${serviceId}`,
    userId: `service-${serviceId}`,
    role: 'service-account',
    services: [{ serviceId, roleId: 'service-account' }],
    permissions: ['prescription:read'],
    chu: { id: chuId },
    iat: now,
    exp: now + 300,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

// Même calcul que le backend : la date porte minuit UTC, on y injecte l'heure (ex. "11:05") en
// composants UTC pour un instant déterministe, indépendant du fuseau de la machine qui exécute.
function combinerDateHeure(dateIntervention, heureIntervention) {
  const base = new Date(dateIntervention);
  const [h, m] = (heureIntervention || '').split(':').map(Number);
  if (isNaN(h)) return base;
  return new Date(
    Date.UTC(
      base.getUTCFullYear(),
      base.getUTCMonth(),
      base.getUTCDate(),
      h,
      isNaN(m) ? 0 : m,
      0,
      0,
    ),
  );
}

async function main() {
  const env = { ...process.env, ...lireEnv() };
  const dbUrl = env.DATABASE_URL;
  const secret = env.CENTRAL_AUTH_JWT_SECRET;
  const serviceId = env.SERVICE_ID;
  const chuId = env.CHU_ID;
  const apiUrl = env.PRESCRIPTION_API_URL;

  if (!dbUrl) { console.error('DATABASE_URL introuvable dans .env'); process.exit(1); }
  if (!secret || !serviceId || !chuId || !apiUrl) {
    console.error('Configuration externe incomplète (CENTRAL_AUTH_JWT_SECRET, SERVICE_ID, CHU_ID, PRESCRIPTION_API_URL)');
    process.exit(1);
  }

  const token = mintServiceToken(secret, serviceId, chuId);
  console.log(`Interrogation de ${apiUrl}/prescriptions/bloc...`);
  const res = await fetch(
    `${apiUrl}/prescriptions/bloc?serviceIdDest=${serviceId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`API Prescriptions répond ${res.status}`);
  const prescriptions = await res.json();
  if (!Array.isArray(prescriptions)) throw new Error('Réponse API inattendue');

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log(`Connecté à la base. ${prescriptions.length} prescription(s) récupérée(s).`);

  let patientsMaj = 0;
  let notifsMaj = 0;
  let sansActe = 0;

  for (const p of prescriptions) {
    const acte = (p.actes || p.ActeBloc || [])[0];
    if (!acte) { sansActe++; continue; }

    const date = acte.dateIntervention
      ? combinerDateHeure(acte.dateIntervention, acte.heureIntervention)
      : null;

    // Ne comble que les champs vides : on ne touche jamais une valeur existante (libelle,
    // typeChirurgie, chirurgien, date) — la prescription externe n'est qu'une source de repli.
    const upPatient = await client.query(
      `UPDATE patients_bloc SET
         "dateIntervention" = COALESCE("dateIntervention", $1),
         libelle = COALESCE(NULLIF(libelle, ''), $2),
         "typeChirurgie" = COALESCE(NULLIF("typeChirurgie", ''), $3),
         "chirurgien_nom" = COALESCE(NULLIF("chirurgien_nom", ''), $4)
       WHERE "patientId" = $5`,
      [
        date,
        acte.libelle || null,
        acte.typeChirurgie || null,
        acte.nomChirurgien || null,
        p.patientId,
      ],
    );
    if (upPatient.rowCount > 0) {
      patientsMaj += upPatient.rowCount;
      console.log(
        `Patient ${p.patientId} : date=${date ? date.toISOString() : 'aucune'}, ` +
        `libelle="${acte.libelle || ''}", type="${acte.typeChirurgie || ''}", ` +
        `chirurgien="${acte.nomChirurgien || ''}"`,
      );
    }

    // intervention porte le placeholder générique "Intervention" posé par l'ancienne ingestion
    // (acte toujours indéfini) — on le remplace par le vrai libellé, sans toucher aux autres.
    const upNotif = await client.query(
      `UPDATE notifications_cpa SET
         "dateIntervention" = COALESCE("dateIntervention", $1),
         intervention = CASE
           WHEN intervention IS NULL OR intervention = '' OR intervention = 'Intervention'
           THEN $2 ELSE intervention END,
         "chirurgienNom" = COALESCE(NULLIF("chirurgienNom", ''), $3)
       WHERE "patientId" = $4`,
      [date, acte.libelle || 'Intervention', acte.nomChirurgien || null, p.patientId],
    );
    if (upNotif.rowCount > 0) {
      notifsMaj += upNotif.rowCount;
      console.log(`  -> ${upNotif.rowCount} notification(s) mises à jour`);
    }
  }

  console.log(
    `\nTerminé : ${patientsMaj} patient(s) et ${notifsMaj} notification(s) mis à jour ` +
    `(${sansActe} prescription(s) sans acte).`,
  );
  await client.end();
}

main().catch((err) => {
  console.error('Erreur :', err.message);
  process.exit(1);
});
