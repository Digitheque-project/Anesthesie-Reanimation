import 'dotenv/config';
import jwt from 'jsonwebtoken';

// ── Test d'arrivée des prescriptions Chirurgie dans le bloc opératoire ─────────
// Vérifie que le backend ingère bien toute nouvelle prescription (DEMANDE_CPA) du
// service Prescriptions externe : après un cycle de polling, elle doit passer en
// RECU_BLOC (= reçue par le bloc, notification + son dans la cloche).
//
// Usage :  node test-prescription-arrivee.mjs
// Pré-requis : backend déployé avec le correctif (garde "même intervention").
// Besoin : qu'une prescription DEMANDE_CPA soit en attente (si aucune, le test
//          t'invite à en créer une depuis l'app Chirurgie puis relancer).

const base = process.env.PRESCRIPTION_API_URL;
const serviceId = process.env.SERVICE_ID;
const chuId = process.env.CHU_ID;
const secret = process.env.CENTRAL_AUTH_JWT_SECRET;
const attenteS = Number(process.env.POLL_WAIT_SECONDS || 30);
const attenteNouvelleS = Number(process.env.NEW_WAIT_SECONDS || 120);

if (!base || !serviceId || !secret) {
  console.error('✗ Variables manquantes (.env) : PRESCRIPTION_API_URL / SERVICE_ID / CENTRAL_AUTH_JWT_SECRET');
  process.exit(1);
}

const pas = (msg) => console.log(`[.] ${msg}`);

function mint() {
  return jwt.sign(
    {
      userId: `service-${serviceId}`,
      name: 'Service',
      firstname: 'Anesthésie-Réanimation',
      email: 'service@anesthesie-reanimation.local',
      services: [
        {
          serviceId,
          serviceName: 'Service Anesthésie-Réanimation',
          baseUrl: '',
          roleId: 'service-account',
          roleName: 'Service',
          permissions: ['prescription:read'],
          chu: { id: chuId },
        },
      ],
    },
    secret,
    { expiresIn: '5m' },
  );
}

async function fetchPrescriptions() {
  const res = await fetch(`${base}/prescriptions/bloc?serviceIdDest=${serviceId}`, {
    headers: { Authorization: `Bearer ${mint()}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function main() {
  console.log('== Test : arrivée d\'une nouvelle prescription Chirurgie dans le bloc ==\n');

  pas('Connexion au service Prescriptions...');
  let avant;
  try {
    avant = await fetchPrescriptions();
  } catch (err) {
    console.error(`✗ Échec connexion service Prescriptions : ${err.message}`);
    process.exit(1);
  }
  console.log(`  OK (${avant.length} prescriptions visibles par le bloc)\n`);

  const enAttente = avant.filter((p) => p.statut === 'DEMANDE_CPA');
  if (enAttente.length === 0) {
    console.log('Aucune prescription DEMANDE_CPA en attente actuellement.');
    console.log(`=> Crée une nouvelle prescription depuis l'app Chirurgie maintenant ;`);
    console.log(`   le test la détectera automatiquement (attente max ${attenteNouvelleS}s)...\n`);
    const debut = Date.now();
    while (Date.now() - debut < attenteNouvelleS * 1000) {
      await new Promise((r) => setTimeout(r, 5000));
      let nouveau;
      try {
        nouveau = (await fetchPrescriptions()).filter((p) => p.statut === 'DEMANDE_CPA');
      } catch {
        nouveau = [];
      }
      if (nouveau.length > 0) {
        console.log('Nouvelle prescription DEMANDE_CPA détectée !');
        return verifier(nouveau);
      }
    }
    console.log('Aucune nouvelle prescription créée dans le délai imparti. Réessaie.');
    process.exit(0);
  }

  return verifier(enAttente);
}

async function verifier(enAttente) {
  console.log(`Prescriptions en attente (DEMANDE_CPA) : ${enAttente.length}`);
  for (const p of enAttente) {
    const acte = p.actes?.[0] ?? p.ActeBloc?.[0];
    console.log(`   - ${p.id.slice(0, 8)}… acte="${acte?.libelle ?? ''}" patient=${p.patientId}`);
  }

  pas(`Attente d'un cycle de polling (${attenteS}s)...`);
  await new Promise((r) => setTimeout(r, attenteS * 1000));

  pas('Re-vérification des statuts...');
  let apres;
  try {
    apres = await fetchPrescriptions();
  } catch (err) {
    console.error(`✗ Échec re-connexion : ${err.message}`);
    process.exit(1);
  }

  const idsAttente = new Set(enAttente.map((p) => p.id));
  const ingerees = apres.filter((p) => idsAttente.has(p.id) && p.statut === 'RECU_BLOC');
  const restantes = apres.filter((p) => idsAttente.has(p.id) && p.statut !== 'RECU_BLOC');

  console.log('');
  if (ingerees.length === enAttente.length) {
    console.log(`✅ PASS — ${ingerees.length}/${enAttente.length} prescription(s) ingérée(s) : passage DEMANDE_CPA → RECU_BLOC`);
    console.log('   La nouvelle prescription est arrivée dans le bloc (notification + son dans la cloche).');
    process.exit(0);
  }
  console.log(`❌ FAIL — seulement ${ingerees.length}/${enAttente.length} ingérée(s)`);
  for (const p of restantes) {
    const acte = p.actes?.[0] ?? p.ActeBloc?.[0];
    console.log(`   - ${p.id.slice(0, 8)}… acte="${acte?.libelle ?? ''}" statut=${p.statut} (toujours bloquée)`);
  }
  console.log('   Cause probable : garde anti-ré-ingestion (même intervention déjà ouverte) ou backend pas redéployé.');
  process.exit(1);
}

main().catch((err) => {
  console.error(`✗ Erreur inattendue : ${err.message}`);
  process.exit(1);
});
