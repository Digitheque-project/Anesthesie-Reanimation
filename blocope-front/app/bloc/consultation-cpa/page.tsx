'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { patientService, planningService, medecinService } from '@/lib/api';
import { apiClient } from '@/lib/api/client';
import { useRole } from '@/lib/hooks/useRole';
import { obtenirSessionValide } from '@/lib/auth/central-session';
import MedicamentsAnesthesieModal, { construireLignesInitiales } from '@/components/bloc/medicaments-anesthesie/MedicamentsAnesthesieModal';
import type { MedicamentRow } from '@/components/bloc/medicaments-anesthesie/MedicamentTable';
import RoleGate from '@/components/bloc/auth/RoleGate';
import { RoleClinique } from '@/lib/auth/role-clinique';
import PrescriptionCpaModal from '@/components/bloc/prescription/PrescriptionCpaModal';

export default function ConsultationCpaPage() {
  return (
    <RoleGate
      allowedRoles={[RoleClinique.ANESTHESISTE, RoleClinique.RESPONSABLE_CPA, RoleClinique.MAJOR]}
      message="Vous ne devez pas faire de CPA."
    >
      <Suspense fallback={<div>Chargement...</div>}>
        <ConsultationCpaPageContent />
      </Suspense>
    </RoleGate>
  );
}

const DEFAULT_FORM = {
  antecedentsAnesthesie: true,
  notesIncidents: '',
  frequenceCardiaque: '',
  taSystolique: '',
  taDiastolique: '',
  taille: '',
  poids: '',
  examenCardiovasculaire: '',
  examenPulmonaire: '',
  examenNeurologique: '',
  colorationConjonctivale: 'Normale (Rose)',
  abordVeineux: '',
  rachis: '',
  ouvertureBuccale: '',
  distanceMentoThyroidienne: '',
  dents: 'Denture saine',
  tabac: 'Non fumeur',
  alcool: 'Aucun',
  typeAnesthesie: 'Anesthésie Générale (AG)',
  techniqueIntubation: 'Sonde Endotrachéale',
  jeune: '',
  jeuneSolides: '',
  jeuneLiquides: '',
  preparationPhysique: '',
  tachesInfirmieres: '',
}

// Reconstitue l'état des 77 lignes du catalogue à partir des médicaments d'anesthésie/
// réanimation déjà enregistrés sur une CPA existante (cochés + dosage/observation restaurés).
function restaurerMedicamentsAnesthesieRows(items: any[] | undefined | null): MedicamentRow[] {
  const lignes = construireLignesInitiales();
  if (!items?.length) return lignes;
  return lignes.map(ligne => {
    const trouve = items.find((i: any) => i.categorie === ligne.categorie && i.nom === ligne.label);
    if (!trouve) return ligne;
    return { ...ligne, selected: true, dosage: trouve.dosage || '', observation: trouve.observation || '' };
  });
}

function formatDateInput(valeur: string | Date | null | undefined): string {
  if (!valeur) return '';
  return new Date(valeur).toISOString().split('T')[0];
}

function ConsultationCpaPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get('patientId') || '';
  const patientNom = searchParams.get('patientNom') || 'Patient';
  const patientIpp = searchParams.get('patientIpp') || '';
  const patientAge = searchParams.get('patientAge') ? parseInt(searchParams.get('patientAge')!) : null;
  const intervention = searchParams.get('intervention') || '';

  const [patient, setPatient] = useState<any>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [scoreMallampati, setScoreMallampati] = useState<number>(1);
  const [scoreASA, setScoreASA] = useState<number | string>(1);
  const [decision, setDecision] = useState<'APTE' | 'INAPTE' | 'REPORT' | ''>('');
  // Devenir de l'opération une fois l'aptitude tranchée — distinct de `decision === 'REPORT'`
  // qui concerne la CPA elle-même (à refaire), pas l'opération.
  const [decisionOperation, setDecisionOperation] = useState<'RETENUE' | 'REPORTEE' | 'REFUSEE' | ''>('');
  const [motifRefus, setMotifRefus] = useState('');
  const [validationProfInformelle, setValidationProfInformelle] = useState('');
  const [dateVPA, setDateVPA] = useState('');
  const [heureVPA, setHeureVPA] = useState('08:00');
  const [loading, setLoading] = useState(false);
  const [showMedicamentModal, setShowMedicamentModal] = useState(false);
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [nouveauMedicament, setNouveauMedicament] = useState({ premedication: '', dose: '', voieAdmin: '', debut: '', frequence: '' });
  const [showCatalogueModal, setShowCatalogueModal] = useState(false);
  const [medicamentsAnesthesieRows, setMedicamentsAnesthesieRows] = useState<MedicamentRow[]>(() => construireLignesInitiales());
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const { peutDeciderAptitudeCpa, estAnesthesisteConnecte, estResponsableCpa, estMajor, roleName } = useRole();
  const [nomAnesthesiste, setNomAnesthesiste] = useState('');
  const [anesthesistes, setAnesthesistes] = useState<any[]>([]);
  const [anesthesisteId, setAnesthesisteId] = useState('');
  const [dateInterventionInput, setDateInterventionInput] = useState('');
  const [savingDateIntervention, setSavingDateIntervention] = useState(false);
  const [cpaExistante, setCpaExistante] = useState<any>(null);
  const [chargementCpa, setChargementCpa] = useState(true);
  const [historiqueCpa, setHistoriqueCpa] = useState<any[]>([]);
  const [ongletHistorique, setOngletHistorique] = useState(false);

  const estResponsableOuMajor = estResponsableCpa || estMajor;

  useEffect(() => {
    const session = obtenirSessionValide();
    if (session) setNomAnesthesiste(`${session.payload.firstname} ${session.payload.name}`.trim());
  }, []);

  // Responsable CPA / Major n'ont pas de fiche Médecin propre : l'anesthésiste ayant réalisé
  // la consultation doit être désigné explicitement dans un sélecteur.
  useEffect(() => {
    if (!estAnesthesisteConnecte) {
      medecinService.getAll({ role: 'ANESTHESISTE' }).then(res => setAnesthesistes(res?.data || [])).catch(console.error);
    }
  }, [estAnesthesisteConnecte]);

  useEffect(() => {
    if (patientId) {
      patientService.getById(patientId).then(setPatient).catch(console.error);
    }
  }, [patientId]);

  // Le Major/Responsable CPA remplit et valide la CPA en premier ; l'anesthésiste rouvre
  // ensuite cette même fiche (en lecture seule sur l'examen) pour n'y ajouter que les
  // médicaments d'anesthésie/réanimation et la date de vérification veille.
  useEffect(() => {
    if (!patientId) { setChargementCpa(false); return; }
    apiClient.get('/cpa', { params: { patientId, limite: 10 } })
      .then(({ data }) => {
        const liste = data?.data || [];
        setCpaExistante(liste[0] || null);
        // Quand le patient revient pour refaire sa CPA (après un report, ou plus tard dans son
        // parcours), les tentatives précédentes restent visibles pour contexte — pas juste la
        // dernière écrasant silencieusement l'historique.
        setHistoriqueCpa(liste.slice(1));
      })
      .catch(console.error)
      .finally(() => setChargementCpa(false));
  }, [patientId]);

  // Pré-remplit tout le formulaire avec la CPA déjà enregistrée, pour que l'anesthésiste voie
  // exactement ce que le Major/Responsable CPA a saisi.
  useEffect(() => {
    if (!cpaExistante) return;
    const c = cpaExistante;
    setForm(f => ({
      ...f,
      antecedentsAnesthesie: c.antecedentsAnesthesie ?? f.antecedentsAnesthesie,
      notesIncidents: c.notesIncidents || '',
      frequenceCardiaque: c.frequenceCardiaque != null ? String(c.frequenceCardiaque) : '',
      taSystolique: c.tensionArterielle?.systolique != null ? String(c.tensionArterielle.systolique) : '',
      taDiastolique: c.tensionArterielle?.diastolique != null ? String(c.tensionArterielle.diastolique) : '',
      taille: c.taille != null ? String(c.taille) : '',
      poids: c.poids != null ? String(c.poids) : '',
      examenCardiovasculaire: c.examenCardiovasculaire || '',
      examenPulmonaire: c.examenPulmonaire || '',
      examenNeurologique: c.examenNeurologique || '',
      colorationConjonctivale: c.colorationConjonctivale || f.colorationConjonctivale,
      abordVeineux: c.abordVeineux || '',
      rachis: c.rachis || '',
      ouvertureBuccale: c.ouvertureBuccale != null ? String(c.ouvertureBuccale) : '',
      distanceMentoThyroidienne: c.distanceMentoThyroidienne != null ? String(c.distanceMentoThyroidienne) : '',
      dents: c.dents || f.dents,
      tabac: c.tabac || f.tabac,
      alcool: c.alcool || f.alcool,
      typeAnesthesie: c.typeAnesthesie || f.typeAnesthesie,
      techniqueIntubation: c.techniqueIntubation || f.techniqueIntubation,
      jeune: c.jeune || '',
      preparationPhysique: c.preparationPhysique || '',
      tachesInfirmieres: c.tachesInfirmieres || '',
    }));
    if (c.mallampati != null) setScoreMallampati(c.mallampati);
    if (c.scoreASA != null) setScoreASA(c.scoreASA);
    if (c.decision) setDecision(c.decision);
    if (c.decisionOperation) setDecisionOperation(c.decisionOperation);
    if (c.motifRefus) setMotifRefus(c.motifRefus);
    if (c.validationProfInformelle) setValidationProfInformelle(c.validationProfInformelle);
    if (c.premedicaments?.length) {
      setMedicaments(c.premedicaments.map((p: any) => ({
        premedication: p.nom, dose: p.dose, voieAdmin: p.voieAdministration, debut: p.debut, frequence: p.frequence,
      })));
    }
    setMedicamentsAnesthesieRows(restaurerMedicamentsAnesthesieRows(c.medicamentsAnesthesieReanimation));
    if (c.dateVerificationVeille) setDateVPA(formatDateInput(c.dateVerificationVeille));
  }, [cpaExistante]);

  // Pré-remplit le champ éditable avec la date/heure d'intervention actuellement enregistrée
  useEffect(() => {
    if (patient?.dateIntervention) {
      const d = new Date(patient.dateIntervention);
      const pad = (n: number) => String(n).padStart(2, '0');
      setDateInterventionInput(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
    }
  }, [patient?.dateIntervention]);

  const estUrgent = patient?.niveauUrgence === 'URGENT' || patient?.niveauUrgence === 'TRES_URGENT';

  // La CPA se remplit en deux temps : le Major/Responsable CPA saisit l'examen et la décision
  // (premier arrivé) ; une fois enregistrée, seul l'anesthésiste peut encore y toucher — pour y
  // ajouter les médicaments d'anesthésie/réanimation et planifier la vérification veille. Un
  // anesthésiste réalisant seul sa propre CPA (aucun Major/Responsable CPA impliqué) garde tous
  // les droits de bout en bout, comme avant.
  const cpaDejaRemplie = !!cpaExistante;
  const peutEditerExamenEtDecision = !cpaDejaRemplie && (estResponsableOuMajor || estAnesthesisteConnecte);
  const peutEditerMedicamentsEtVpa = estAnesthesisteConnecte;

  const handleEnregistrerDateIntervention = async () => {
    const patientIdFinal = patientId || patient?.id;
    if (!patientIdFinal || !dateInterventionInput) return;
    setSavingDateIntervention(true);
    try {
      const updated = await patientService.modifierDateIntervention(patientIdFinal, new Date(dateInterventionInput).toISOString());
      setPatient((p: any) => ({ ...p, dateIntervention: updated?.dateIntervention ?? p?.dateIntervention }));
      alert('✅ Date et heure de l\'opération mises à jour');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erreur inconnue';
      alert('❌ Erreur: ' + JSON.stringify(message));
    } finally {
      setSavingDateIntervention(false);
    }
  };

  const setField = (key: keyof typeof DEFAULT_FORM) => (e: any) => setForm(f => ({ ...f, [key]: e.target.value }))

  const ajouterMedicament = () => {
    if (nouveauMedicament.premedication && nouveauMedicament.dose) {
      setMedicaments([...medicaments, { ...nouveauMedicament }]);
      setNouveauMedicament({ premedication: '', dose: '', voieAdmin: '', debut: '', frequence: '' });
      setShowMedicamentModal(false);
    }
  };

  const supprimerMedicament = (index: number) => {
    setMedicaments(medicaments.filter((_, i) => i !== index));
  };

  const medicamentsSelectionnes = medicamentsAnesthesieRows.filter(r => r.selected);

  const planifierVerificationVeille = async (patientIdFinal: string) => {
    if (estUrgent || decision === 'INAPTE' || !dateVPA) return;
    const [h, m] = heureVPA.split(':').map(Number);
    const fin = new Date(); fin.setHours(h, m + 30);
    await planningService.reserverCreneau({
      patientId: patientIdFinal,
      date: dateVPA,
      heureDebut: heureVPA,
      heureFin: fin.toTimeString().split(' ')[0].substring(0, 5),
      salle: 'Vérification veille-1',
      estUrgence: false,
      type: 'VERIFICATION_VEILLE',
    });
  };

  const handleValider = async () => {
    const patientIdFinal = patientId || patient?.id;
    if (!patientIdFinal) { alert('❌ Patient introuvable'); return; }

    // Seule la décision finale est obligatoire — toutes les mesures cliniques restent libres et
    // sont omises du payload si non renseignées plutôt que forcées à 0 (valeur cliniquement fausse).
    const versNombre = (valeur: string) => (valeur === '' || isNaN(Number(valeur)) ? undefined : Number(valeur));

    setLoading(true);
    try {
      if (!cpaDejaRemplie) {
        // Première étape : le Major/Responsable CPA (ou l'anesthésiste s'il réalise seul sa
        // propre CPA) remplit l'examen et pose la décision.
        if (!peutEditerExamenEtDecision) { alert('❌ Seul un anesthésiste, un responsable CPA ou un major peut remplir et valider la CPA'); setLoading(false); return; }
        if (!estAnesthesisteConnecte && !anesthesisteId) { alert("❌ Sélectionnez l'anesthésiste ayant réalisé la consultation"); setLoading(false); return; }
        if (!decision) { alert('❌ Sélectionnez une décision (Apte / Inapte / Report)'); setLoading(false); return; }
        if ((decision === 'INAPTE' || decision === 'REPORT') && !motifRefus.trim()) {
          alert(`❌ Le motif ${decision === 'INAPTE' ? 'du refus' : 'du report'} est obligatoire`); setLoading(false); return;
        }

        const payload = {
          patientId: patientIdFinal,
          anesthesisteId: estAnesthesisteConnecte ? undefined : anesthesisteId,
          dateConsultation: new Date().toISOString().split('T')[0],
          antecedentsAnesthesie: form.antecedentsAnesthesie,
          notesIncidents: form.notesIncidents || undefined,
          frequenceCardiaque: versNombre(form.frequenceCardiaque),
          tensionArterielle: (form.taSystolique !== '' && form.taDiastolique !== '')
            ? { systolique: versNombre(form.taSystolique), diastolique: versNombre(form.taDiastolique) }
            : undefined,
          taille: versNombre(form.taille),
          poids: versNombre(form.poids),
          examenCardiovasculaire: form.examenCardiovasculaire || 'RAS',
          examenPulmonaire: form.examenPulmonaire || 'RAS',
          examenNeurologique: form.examenNeurologique || 'RAS',
          colorationConjonctivale: form.colorationConjonctivale,
          abordVeineux: form.abordVeineux || 'RAS',
          rachis: form.rachis || 'RAS',
          mallampati: scoreMallampati,
          ouvertureBuccale: versNombre(form.ouvertureBuccale),
          distanceMentoThyroidienne: versNombre(form.distanceMentoThyroidienne),
          dents: form.dents,
          tabac: form.tabac,
          alcool: form.alcool,
          scoreASA: typeof scoreASA === 'string' ? scoreASA : Number(scoreASA),
          decision,
          decisionOperation: (decision === 'APTE' || decision === 'INAPTE') ? (decisionOperation || undefined) : undefined,
          motifRefus: (decision === 'INAPTE' || decision === 'REPORT') ? motifRefus.trim() : undefined,
          validationProfInformelle: validationProfInformelle.trim() || undefined,
          typeAnesthesie: form.typeAnesthesie,
          techniqueIntubation: form.techniqueIntubation,
          premedicaments: medicaments.map(m => ({
            nom: m.premedication,
            dose: m.dose,
            voieAdministration: m.voieAdmin,
            debut: m.debut || 'H-1',
            frequence: m.frequence || '1x/jour'
          })),
          // Ne s'applique que si l'anesthésiste réalise seul sa propre CPA (sinon cette partie
          // est réservée à l'étape suivante, complétée par l'anesthésiste).
          medicamentsAnesthesieReanimation: (peutEditerMedicamentsEtVpa && medicamentsSelectionnes.length)
            ? medicamentsSelectionnes.map(r => ({
                categorie: r.categorie,
                nom: r.label,
                dosage: r.dosage || undefined,
                observation: r.observation || undefined,
              }))
            : undefined,
          jeune: form.jeune || `Solides : ${form.jeuneSolides || 'À partir de minuit'} — Liquide : ${form.jeuneLiquides || "Jusqu'à H-2"}`,
          preparationPhysique: form.preparationPhysique || 'RAS',
          tachesInfirmieres: form.tachesInfirmieres || 'RAS',
          dateVerificationVeille: (peutEditerMedicamentsEtVpa && !estUrgent && decision !== 'INAPTE' && dateVPA) ? dateVPA : undefined,
        };

        await apiClient.post('/cpa', payload);
        if (peutEditerMedicamentsEtVpa) await planifierVerificationVeille(patientIdFinal);

        alert(estUrgent ? '✅ VPA validée avec succès !' : '✅ CPA validée avec succès !');
        router.push('/bloc/rendez-vous');
      } else {
        // Deuxième étape : l'anesthésiste complète la CPA déjà remplie par le Major/Responsable
        // CPA — uniquement les médicaments d'anesthésie/réanimation et la vérification veille.
        if (!peutEditerMedicamentsEtVpa) { alert("❌ Seul l'anesthésiste peut compléter les médicaments et la date de vérification veille"); setLoading(false); return; }

        await apiClient.patch(`/cpa/${cpaExistante.id}`, {
          medicamentsAnesthesieReanimation: medicamentsSelectionnes.length
            ? medicamentsSelectionnes.map(r => ({
                categorie: r.categorie,
                nom: r.label,
                dosage: r.dosage || undefined,
                observation: r.observation || undefined,
              }))
            : undefined,
          dateVerificationVeille: (!estUrgent && decision !== 'INAPTE' && dateVPA) ? dateVPA : undefined,
        });
        await planifierVerificationVeille(patientIdFinal);

        alert('✅ Médicaments et vérification veille enregistrés !');
        router.push('/bloc/rendez-vous');
      }
    } catch (err: any) {
      console.error('❌ Erreur validation:', err);
      const message = err.response?.data?.message || err.message || 'Erreur inconnue';
      alert('❌ Erreur: ' + JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 space-y-2">
      <div className={`rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2 ${estUrgent ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'}`}>
        <span className="material-symbols-outlined text-lg">{estUrgent ? 'bolt' : 'event_available'}</span>
        {estUrgent ? 'Visite Pré-Anesthésique (VPA) — patient urgent, consultation immédiate' : 'Consultation Pré-Anesthésique (CPA)'}
      </div>

      {cpaDejaRemplie && !chargementCpa && (
        <div className={`rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-2 ${peutEditerMedicamentsEtVpa ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-surface-container-low text-on-surface-variant'}`}>
          <span className="material-symbols-outlined text-lg">{peutEditerMedicamentsEtVpa ? 'medication' : 'visibility'}</span>
          {peutEditerMedicamentsEtVpa
            ? "CPA déjà remplie et validée — complétez les médicaments d'anesthésie/réanimation et la vérification veille ci-dessous."
            : 'CPA déjà remplie et validée — consultation en lecture seule.'}
        </div>
      )}

      {/* Patient Context Header */}
      <div className="bg-surface-bright rounded-xl p-4 flex flex-wrap items-center justify-between shadow-sm border border-white/50">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">account_circle</span>
          </div>
          <div>
            <h1 className="text-xl font-bold font-headline text-on-surface">{patientNom}</h1>
            <p className="text-sm text-on-surface-variant">
              {patientAge ? `${patientAge} ans` : ''}{patient?.sexe ? ` • ${patient.sexe}` : ''}{patient?.chambre ? ` • Chambre ${patient.chambre}` : ''}{patientIpp ? ` • IPP: ${patientIpp}` : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => router.push(`/bloc/dossier-patient/${patientId}/complet`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-all">
            <span className="material-symbols-outlined text-lg">folder_open</span> Voir dossier
          </button>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Intervention prévue</p>
            <p className="text-sm font-semibold text-primary">{intervention || patient?.libelle || '—'}</p>
          </div>
          <div className="h-10 w-[1px] bg-outline-variant/30 hidden sm:block"></div>
          <div className="flex flex-col items-center">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${estUrgent ? 'bg-red-100 text-red-700' : 'bg-secondary/10 text-secondary'}`}>
              {estUrgent ? 'NON PROGRAMMÉ' : 'PROGRAMMÉ'}
            </span>
          </div>
        </div>
      </div>

      {/* Date et heure prévues de l'opération — modifiable par le Responsable CPA ou le Major
          pendant la réalisation de la consultation (ex. créneau chirurgical décalé) */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <span className="material-symbols-outlined text-primary">event</span>
        {estResponsableOuMajor ? (
          <>
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs font-semibold text-on-surface-variant block mb-1">Date et heure prévues de l'opération</label>
              <input type="datetime-local" value={dateInterventionInput} onChange={e => setDateInterventionInput(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-lg p-2 text-sm font-bold" />
            </div>
            <button onClick={handleEnregistrerDateIntervention} disabled={savingDateIntervention || !dateInterventionInput}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50 self-end">
              <span className="material-symbols-outlined text-lg">save</span>
              {savingDateIntervention ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        ) : (
          <div>
            <p className="text-xs font-semibold text-on-surface-variant">Date et heure prévues de l'opération</p>
            <p className="text-sm font-bold text-on-surface">
              {patient?.dateIntervention ? new Date(patient.dateIntervention).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
            </p>
          </div>
        )}
      </div>

      {/* Anesthésiste réalisant la consultation — uniquement pertinent tant que la CPA n'est pas
          encore remplie (désignation faite par le Major/Responsable CPA à la création) */}
      {!cpaDejaRemplie && (
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">badge</span>
          {estAnesthesisteConnecte ? (
            <div>
              <p className="text-xs font-semibold text-on-surface-variant">Anesthésiste réalisant la consultation</p>
              <p className="text-sm font-bold text-on-surface">{nomAnesthesiste || '—'}</p>
            </div>
          ) : (
            <div className="flex-1">
              <label className="text-xs font-semibold text-on-surface-variant block mb-1">Anesthésiste ayant réalisé la consultation *</label>
              <select value={anesthesisteId} onChange={e => setAnesthesisteId(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-lg p-2 text-sm font-bold">
                <option value="">— Sélectionner —</option>
                {anesthesistes.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <div className="flex flex-col lg:flex-row gap-2">
        {/* COLONNE GAUCHE */}
        <div className={`flex-1 space-y-2 ${!peutEditerExamenEtDecision ? 'opacity-80' : ''}`}>
          {/* Antécédents anesthésiques */}
          <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">history_edu</span>
              <h2 className="text-lg font-bold font-headline text-primary">Antécédents anesthésiques</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant">Antécédents d'anesthésie ?</label>
                <div className="flex gap-2">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 border border-outline-variant rounded-xl transition-colors has-[:checked]:bg-primary-fixed has-[:checked]:border-primary ${peutEditerExamenEtDecision ? 'cursor-pointer hover:bg-surface-container' : 'cursor-not-allowed'}`}>
                    <input disabled={!peutEditerExamenEtDecision} checked={form.antecedentsAnesthesie} onChange={() => setForm(f => ({ ...f, antecedentsAnesthesie: true }))} className="hidden" name="history" type="radio" /><span className="text-sm font-bold">OUI</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 border border-outline-variant rounded-xl transition-colors has-[:checked]:bg-primary-fixed has-[:checked]:border-primary ${peutEditerExamenEtDecision ? 'cursor-pointer hover:bg-surface-container' : 'cursor-not-allowed'}`}>
                    <input disabled={!peutEditerExamenEtDecision} checked={!form.antecedentsAnesthesie} onChange={() => setForm(f => ({ ...f, antecedentsAnesthesie: false }))} className="hidden" name="history" type="radio" /><span className="text-sm font-bold">NON</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant">Notes d'incidents</label>
                <textarea disabled={!peutEditerExamenEtDecision} value={form.notesIncidents} onChange={setField('notesIncidents')} className="w-full h-24 bg-surface-container-low border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 disabled:opacity-60" placeholder="Décrire tout incident..."></textarea>
              </div>
            </div>
          </section>

          {/* Examen clinique */}
          <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">stethoscope</span>
              <h2 className="text-lg font-bold font-headline text-primary">Examen clinique</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <div className="md:col-span-3 bg-surface-container-low rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">CONSTANTES</h3>
                <div className="space-y-3">
                  <div><label className="text-[10px] font-bold block mb-1">Fréquence Cardiaque (BPM)</label><input disabled={!peutEditerExamenEtDecision} value={form.frequenceCardiaque} onChange={setField('frequenceCardiaque')} className="w-full bg-white border-none rounded-lg p-2 text-lg font-bold text-primary disabled:opacity-60" type="number" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-[10px] font-bold block mb-1">TA Syst.</label><input disabled={!peutEditerExamenEtDecision} value={form.taSystolique} onChange={setField('taSystolique')} className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold disabled:opacity-60" type="number" /></div>
                    <div><label className="text-[10px] font-bold block mb-1">TA Diast.</label><input disabled={!peutEditerExamenEtDecision} value={form.taDiastolique} onChange={setField('taDiastolique')} className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold disabled:opacity-60" type="number" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-[10px] font-bold block mb-1">Taille (cm)</label><input disabled={!peutEditerExamenEtDecision} value={form.taille} onChange={setField('taille')} className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold disabled:opacity-60" placeholder="170" type="number" /></div>
                    <div><label className="text-[10px] font-bold block mb-1">Poids (kg)</label><input disabled={!peutEditerExamenEtDecision} value={form.poids} onChange={setField('poids')} className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold disabled:opacity-60" placeholder="70" type="number" /></div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-5 grid grid-cols-1 gap-3">
                <div><label className="text-xs font-bold uppercase tracking-tighter">Cardio-vasculaire</label><textarea disabled={!peutEditerExamenEtDecision} value={form.examenCardiovasculaire} onChange={setField('examenCardiovasculaire')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20 disabled:opacity-60" placeholder="Bruit du coeur..."></textarea></div>
                <div><label className="text-xs font-bold uppercase tracking-tighter">Pulmonaire</label><textarea disabled={!peutEditerExamenEtDecision} value={form.examenPulmonaire} onChange={setField('examenPulmonaire')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20 disabled:opacity-60" placeholder="Murmure vésiculaire..."></textarea></div>
                <div><label className="text-xs font-bold uppercase tracking-tighter">Neurologique</label><textarea disabled={!peutEditerExamenEtDecision} value={form.examenNeurologique} onChange={setField('examenNeurologique')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20 disabled:opacity-60" placeholder="Etat de conscience..."></textarea></div>
              </div>
              <div className="md:col-span-4 grid grid-cols-1 gap-3">
                <div><label className="text-xs font-bold uppercase tracking-tighter">Coloration Conjonctivale</label>
                  <select disabled={!peutEditerExamenEtDecision} value={form.colorationConjonctivale} onChange={setField('colorationConjonctivale')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm disabled:opacity-60">
                    <option>Normale (Rose)</option><option>Pâleur</option><option>Ictère</option><option>Congestion</option>
                  </select>
                </div>
                <div><label className="text-xs font-bold uppercase tracking-tighter">Abords veineux</label><textarea disabled={!peutEditerExamenEtDecision} value={form.abordVeineux} onChange={setField('abordVeineux')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20 disabled:opacity-60" placeholder="Qualité du réseau..."></textarea></div>
                <div><label className="text-xs font-bold uppercase tracking-tighter">Rachis</label><textarea disabled={!peutEditerExamenEtDecision} value={form.rachis} onChange={setField('rachis')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20 disabled:opacity-60" placeholder="Mobilité, déformation..."></textarea></div>
              </div>
            </div>
          </section>

          {/* Voies aériennes */}
          <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">air</span>
              <h2 className="text-lg font-bold font-headline text-primary">Voies aériennes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold block">Mallampati Score</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((score) => (
                    <button key={score} onClick={() => setScoreMallampati(score)} disabled={!peutEditerExamenEtDecision}
                      className={`p-3 rounded-lg border font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${scoreMallampati === score ? 'border-primary bg-primary-fixed text-primary' : 'border-outline-variant bg-white hover:bg-primary-fixed'}`}>
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2"><label className="text-sm font-semibold block">Ouverture buccale</label><div className="relative"><input disabled={!peutEditerExamenEtDecision} value={form.ouvertureBuccale} onChange={setField('ouvertureBuccale')} className="w-full bg-surface-container-low border-none rounded-xl p-3 pr-10 text-sm disabled:opacity-60" placeholder="cm" type="number" /><span className="absolute right-3 top-3 text-xs font-bold">CM</span></div></div>
              <div className="space-y-2"><label className="text-sm font-semibold block">DMTC</label><div className="relative"><input disabled={!peutEditerExamenEtDecision} value={form.distanceMentoThyroidienne} onChange={setField('distanceMentoThyroidienne')} className="w-full bg-surface-container-low border-none rounded-xl p-3 pr-10 text-sm disabled:opacity-60" placeholder="cm" type="number" /><span className="absolute right-3 top-3 text-xs font-bold">CM</span></div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 border-t border-outline-variant/20 pt-4">
              <div className="space-y-2"><label className="text-sm font-semibold uppercase tracking-widest text-[10px]">DENTS</label>
                <select disabled={!peutEditerExamenEtDecision} value={form.dents} onChange={setField('dents')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm disabled:opacity-60">
                  <option>Denture saine</option><option>Prothèse amovible</option><option>Dents fragiles/mobiles</option>
                </select>
              </div>
              <div className="space-y-2"><label className="text-sm font-semibold uppercase tracking-widest text-[10px]">TABAC</label>
                <select disabled={!peutEditerExamenEtDecision} value={form.tabac} onChange={setField('tabac')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm disabled:opacity-60">
                  <option>Non fumeur</option><option>Fumeur actif</option><option>Fumeur passif</option><option>Ancien fumeur</option>
                </select>
              </div>
              <div className="space-y-2"><label className="text-sm font-semibold uppercase tracking-widest text-[10px]">ALCOOLS</label>
                <select disabled={!peutEditerExamenEtDecision} value={form.alcool} onChange={setField('alcool')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm disabled:opacity-60">
                  <option>Aucun</option><option>Occasionnel</option><option>Régulier</option><option>Chronique</option><option>Sevrage</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* COLONNE DROITE */}
        <div className={`w-full lg:w-80 space-y-2 ${!peutEditerExamenEtDecision ? 'opacity-80' : ''}`}>
          <section className="bg-primary-container text-on-primary rounded-2xl p-4 shadow-lg shadow-primary/20">
            <h2 className="text-lg font-bold font-headline mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>award_star</span> Score ASA
            </h2>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[1, 2, 3, 4, 5, 6].map((score) => (
                <button key={score} onClick={() => setScoreASA(score)} disabled={!peutEditerExamenEtDecision}
                  className={`aspect-square rounded-xl font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${scoreASA === score ? 'bg-white text-primary shadow-md scale-105' : 'bg-white/20 hover:bg-white/40'}`}>
                  {score}
                </button>
              ))}
              <button onClick={() => setScoreASA('E')} disabled={!peutEditerExamenEtDecision}
                className={`col-span-2 aspect-[2/1] rounded-xl font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${scoreASA === 'E' ? 'bg-white text-primary shadow-md scale-105' : 'bg-tertiary-container/40 hover:bg-tertiary-container/60'}`}>
                ASA E
              </button>
            </div>
            <p className="text-[10px] text-white/70 uppercase font-bold text-center">Patient avec pathologie systémique sévère</p>
          </section>

          <section className="bg-white rounded-2xl shadow-md border-2 border-secondary/20 overflow-hidden">
            <div className="bg-gradient-to-r from-secondary to-secondary/80 px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-white">vaccines</span>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest">Protocole retenu</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wide block mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">medication_liquid</span> Type d'anesthésie
                </label>
                <select disabled={!peutEditerExamenEtDecision} value={form.typeAnesthesie} onChange={setField('typeAnesthesie')} className="w-full bg-white border border-secondary/20 rounded-xl p-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-secondary/30 outline-none disabled:opacity-60">
                  <option>Anesthésie Générale (AG)</option><option>Rachianesthésie</option><option>ALR</option><option>Sédation</option>
                </select>
              </div>
              <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wide block mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">air</span> Technique d'intubation
                </label>
                <select disabled={!peutEditerExamenEtDecision} value={form.techniqueIntubation} onChange={setField('techniqueIntubation')} className="w-full bg-white border border-secondary/20 rounded-xl p-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-secondary/30 outline-none disabled:opacity-60">
                  <option>Sonde Endotrachéale</option><option>Masque Laryngé</option><option>IOT Séquence Rapide</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Instructions & Prescription */}
      <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-b from-blue-50/80 to-white shadow-md overflow-hidden">
        <div className="px-4 py-3 bg-blue-100/70 border-b border-blue-200 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">assignment</span>
          <h2 className="text-sm font-extrabold text-blue-900 uppercase tracking-widest">Instructions Pré-opératoires</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={!peutEditerExamenEtDecision ? 'opacity-80' : ''}>
              <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm mb-4">
              <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-blue-600">pill</span> Prémédication</h3>
              <div className="overflow-hidden border border-surface-container rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container text-[10px] uppercase font-bold text-on-surface-variant">
                    <tr><th className="px-4 py-3">Prémédication</th><th className="px-4 py-3">Dose</th><th className="px-4 py-3">Voie d'Admin</th><th className="px-4 py-3">Début</th><th className="px-4 py-3">Fréquence</th><th className="px-4 py-3">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {medicaments.map((med, i) => (
                      <tr key={i} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-3 font-semibold">{med.premedication}</td><td className="px-4 py-3">{med.dose}</td><td className="px-4 py-3">{med.voieAdmin}</td><td className="px-4 py-3">{med.debut || '-'}</td><td className="px-4 py-3">{med.frequence || '-'}</td>
                        <td className="px-4 py-3">
                          {peutEditerExamenEtDecision && (
                            <button onClick={() => supprimerMedicament(i)} className="text-error"><span className="material-symbols-outlined text-sm">delete</span></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {peutEditerExamenEtDecision && (
                  <button onClick={() => setShowMedicamentModal(true)} className="w-full py-3 text-xs font-bold text-primary hover:bg-primary-fixed/20 transition-colors">+ AJOUTER UN MÉDICAMENT</button>
                )}
              </div>
              </div>

              {showMedicamentModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                    <h3 className="text-lg font-extrabold mb-2">Ajouter un médicament</h3>
                    <div className="space-y-3">
                      <div><label className="text-xs font-bold block mb-1">Prémédication</label><input type="text" value={nouveauMedicament.premedication} onChange={(e) => setNouveauMedicament({ ...nouveauMedicament, premedication: e.target.value })} className="w-full border rounded-lg p-2 text-sm" /></div>
                      <div><label className="text-xs font-bold block mb-1">Dose</label><input type="text" value={nouveauMedicament.dose} onChange={(e) => setNouveauMedicament({ ...nouveauMedicament, dose: e.target.value })} className="w-full border rounded-lg p-2 text-sm" /></div>
                      <div><label className="text-xs font-bold block mb-1">Voie d'administration</label><input type="text" value={nouveauMedicament.voieAdmin} onChange={(e) => setNouveauMedicament({ ...nouveauMedicament, voieAdmin: e.target.value })} className="w-full border rounded-lg p-2 text-sm" /></div>
                      <div><label className="text-xs font-bold block mb-1">Début</label><input type="text" value={nouveauMedicament.debut} onChange={(e) => setNouveauMedicament({ ...nouveauMedicament, debut: e.target.value })} className="w-full border rounded-lg p-2 text-sm" /></div>
                      <div><label className="text-xs font-bold block mb-1">Fréquence</label><input type="text" value={nouveauMedicament.frequence} onChange={(e) => setNouveauMedicament({ ...nouveauMedicament, frequence: e.target.value })} className="w-full border rounded-lg p-2 text-sm" /></div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => setShowMedicamentModal(false)} className="px-6 py-2 border rounded-lg text-sm font-bold">Annuler</button>
                      <button onClick={ajouterMedicament} className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold">Ajouter</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm space-y-2">
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-800">Jeûne</label><textarea disabled={!peutEditerExamenEtDecision} value={form.jeune} onChange={setField('jeune')} className="w-full h-20 bg-blue-50/60 border-none rounded-xl p-3 text-sm disabled:opacity-60" placeholder="Instructions spécifiques..."></textarea></div>
                <div className="bg-blue-50/60 rounded-xl p-4 border-l-4 border-blue-400">
                  <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-2"><span className="material-symbols-outlined">no_food</span>Règles de jeûne</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-3 rounded-lg">
                      <label className="text-[10px] font-bold uppercase block mb-1">Solides</label>
                      <input disabled={!peutEditerExamenEtDecision} value={form.jeuneSolides} onChange={setField('jeuneSolides')} placeholder="À partir de minuit" className="w-full bg-transparent border-none text-sm font-bold p-0 focus:ring-0 disabled:opacity-60 placeholder:font-normal placeholder:text-gray-400" />
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <label className="text-[10px] font-bold uppercase block mb-1">Liquide</label>
                      <input disabled={!peutEditerExamenEtDecision} value={form.jeuneLiquides} onChange={setField('jeuneLiquides')} placeholder="Jusqu'à H-2" className="w-full bg-transparent border-none text-sm font-bold p-0 focus:ring-0 disabled:opacity-60 placeholder:font-normal placeholder:text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-800">Préparation physique</label><textarea disabled={!peutEditerExamenEtDecision} value={form.preparationPhysique} onChange={setField('preparationPhysique')} className="w-full h-20 bg-blue-50/60 border-none rounded-xl p-3 text-sm disabled:opacity-60" placeholder="Douche, dépilation..."></textarea></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-800">Tâches soignantes</label><textarea disabled={!peutEditerExamenEtDecision} value={form.tachesInfirmieres} onChange={setField('tachesInfirmieres')} className="w-full h-20 bg-blue-50/60 border-none rounded-xl p-3 text-sm disabled:opacity-60" placeholder="Surveillance, constantes..."></textarea></div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
              <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-blue-600">medication</span> Médicaments d'anesthésie et de réanimation</h3>
              <p className="text-xs text-on-surface-variant mb-2">À prévoir pour l'anesthésie et une éventuelle réanimation peropératoire — distinct de la prémédication, rempli par l'anesthésiste.</p>
              {!peutEditerMedicamentsEtVpa && (
                <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  Réservé à l'anesthésiste{roleName ? ` (votre rôle : ${roleName})` : ''}.
                </div>
              )}
              <button type="button" onClick={() => peutEditerMedicamentsEtVpa && setShowCatalogueModal(true)} disabled={!peutEditerMedicamentsEtVpa}
                className="w-full flex items-center justify-between p-4 border border-surface-container rounded-xl hover:bg-primary-fixed/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                <span className="flex items-center gap-2 text-sm font-bold text-primary">
                  <span className="material-symbols-outlined">checklist</span>
                  Liste des médicaments ({medicamentsSelectionnes.length}/77 sélectionnés)
                </span>
                <span className="text-xs font-bold text-primary underline">{peutEditerMedicamentsEtVpa ? 'Ouvrir la liste complète' : 'Voir la liste'}</span>
              </button>

              <MedicamentsAnesthesieModal
                open={showCatalogueModal}
                onClose={() => setShowCatalogueModal(false)}
                rows={medicamentsAnesthesieRows}
                onRowsChange={setMedicamentsAnesthesieRows}
              />
              </div>
            </div>
          </div>

          {/* Prescription pendant la CPA — au cas où l'anesthésiste/responsable CPA/major en a
              besoin, avant la décision finale. Envoyée dans le dossier partagé du patient avec
              son service d'origine comme destinataire explicite (pas d'action obligatoire). */}
          <div className="mt-4 pt-4 border-t border-surface-container">
            <h3 className="text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">clinical_notes</span> Prescription
            </h3>
            {!peutDeciderAptitudeCpa ? (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                Prescrire pendant la CPA est réservé à l'anesthésiste, au responsable CPA ou au major{roleName ? ` (votre rôle : ${roleName})` : ''}.
              </div>
            ) : (
              <>
                <p className="text-xs text-on-surface-variant mb-2">
                  Au cas où une prescription est nécessaire pendant la CPA{patient?.serviceOrigine ? ` — sera envoyée à ${patient.serviceOrigine}` : ''}.
                </p>
                <button type="button" onClick={() => setShowPrescriptionModal(true)}
                  className="w-full flex items-center justify-between p-4 border border-surface-container rounded-xl hover:bg-primary-fixed/10 transition-colors">
                  <span className="flex items-center gap-2 text-sm font-bold text-primary">
                    <span className="material-symbols-outlined">edit_note</span>
                    Prescrire
                  </span>
                  <span className="text-xs font-bold text-primary underline">Ouvrir</span>
                </button>
              </>
            )}

            <PrescriptionCpaModal
              open={showPrescriptionModal}
              onClose={() => setShowPrescriptionModal(false)}
              patientId={patientId || patient?.id || ''}
              serviceDestOverride={
                patient?.serviceOrigineId && patient?.serviceOrigine
                  ? { serviceId: patient.serviceOrigineId, serviceName: patient.serviceOrigine }
                  : undefined
              }
            />
          </div>

          {/* Décision Finale — seul champ réellement obligatoire de la consultation : mise en
              évidence forte (cadre doré) pour la distinguer de tous les autres champs libres */}
          <div className="mt-4 pt-4 border-t border-surface-container">
            <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/80 to-white shadow-md overflow-hidden">
              <div className="px-4 py-3 bg-amber-100/70 border-b border-amber-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">gavel</span>
                <h2 className="text-sm font-extrabold text-amber-900 uppercase tracking-widest">Décision Finale</h2>
                <span className="ml-auto px-2 py-0.5 bg-amber-500 text-white text-[10px] font-extrabold uppercase rounded-full">Obligatoire</span>
              </div>
              <div className="p-4">
                {!peutEditerExamenEtDecision && !cpaDejaRemplie && (
                  <div className="mb-3 p-2 bg-amber-100 border border-amber-300 rounded-lg text-xs text-amber-900">
                    Décision réservée au responsable CPA, au major, ou à l'anesthésiste s'il réalise seul sa CPA{roleName ? ` (votre rôle : ${roleName})` : ''}.
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'APTE', label: "Apte à l'anesthésie", icon: 'check_circle', activeClass: 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' },
                    { key: 'INAPTE', label: 'Inapte à ce jour', icon: 'cancel', activeClass: 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/30' },
                    { key: 'REPORT', label: 'CPA à reporter', sousLabel: '(pas l\'opération — à refaire après examens)', icon: 'schedule', activeClass: 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30' },
                  ].map(opt => (
                    <button key={opt.key} onClick={() => { setDecision(opt.key as any); setDecisionOperation(''); }} disabled={!peutEditerExamenEtDecision}
                      className={`w-full flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                        decision === opt.key ? opt.activeClass + ' scale-[1.02]' : 'border-outline-variant bg-white text-on-surface-variant hover:border-amber-300 hover:bg-amber-50'
                      }`}>
                      <span className="material-symbols-outlined text-2xl" style={decision === opt.key ? { fontVariationSettings: "'FILL' 1" } : undefined}>{opt.icon}</span>
                      <span className="font-bold text-sm text-center">{opt.label}</span>
                      {opt.sousLabel && <span className={`text-[10px] font-medium text-center leading-tight ${decision === opt.key ? 'text-white/85' : 'text-on-surface-variant/70'}`}>{opt.sousLabel}</span>}
                    </button>
                  ))}
                </div>

                {/* Devenir de l'opération — sous-choix affiché une fois l'aptitude tranchée.
                    Distinct du bouton "CPA à reporter" ci-dessus : ici la CPA est terminée, on
                    statue sur l'opération elle-même. Le rendez-vous n'est pas obligatoire en cas
                    de report. */}
                {(decision === 'APTE' || decision === 'INAPTE') && (
                  <div className="mt-3 pt-3 border-t border-amber-200/60">
                    <label className="text-xs font-bold text-amber-900 uppercase tracking-wide block mb-2">Devenir de l'opération</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(decision === 'APTE'
                        ? [
                            { key: 'RETENUE', label: "Date d'opération retenue", icon: 'event_available', activeClass: 'bg-emerald-500 border-emerald-500 text-white' },
                            { key: 'REPORTEE', label: "Date d'opération reportée", icon: 'event_busy', activeClass: 'bg-orange-500 border-orange-500 text-white' },
                          ]
                        : [
                            { key: 'REPORTEE', label: "Date d'opération reportée", icon: 'event_busy', activeClass: 'bg-orange-500 border-orange-500 text-white' },
                            { key: 'REFUSEE', label: 'Opération refusée (impossible)', icon: 'block', activeClass: 'bg-red-600 border-red-600 text-white' },
                          ]
                      ).map(opt => (
                        <button key={opt.key} type="button" onClick={() => setDecisionOperation(opt.key as any)} disabled={!peutEditerExamenEtDecision}
                          className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                            decisionOperation === opt.key ? opt.activeClass : 'border-outline-variant bg-white text-on-surface-variant hover:border-amber-300 hover:bg-amber-50'
                          }`}>
                          <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {decisionOperation === 'REPORTEE' && (
                      <p className="text-[11px] text-orange-700 mt-2">La prise de rendez-vous pour la nouvelle date n'est pas obligatoire à cette étape — elle pourra être planifiée plus tard.</p>
                    )}
                  </div>
                )}

                {decision === 'INAPTE' && (
                  <div className="mt-3">
                    <label className="text-xs font-bold text-red-700 block mb-1">Motif du refus *</label>
                    <textarea disabled={!peutEditerExamenEtDecision} value={motifRefus} onChange={e => setMotifRefus(e.target.value)}
                      className="w-full h-20 bg-red-50 border border-red-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-300 outline-none disabled:opacity-60" placeholder="Expliquez le motif de l'inaptitude..." />
                  </div>
                )}
                {decision === 'REPORT' && (
                  <div className="mt-3">
                    <p className="text-[11px] text-orange-700 mb-2">Ce report concerne la CPA elle-même (à refaire plus tard, par exemple si des examens complémentaires sont nécessaires avant de statuer) — pas la date de l'opération.</p>
                    <label className="text-xs font-bold text-orange-700 block mb-1">Motif du report *</label>
                    <textarea disabled={!peutEditerExamenEtDecision} value={motifRefus} onChange={e => setMotifRefus(e.target.value)}
                      className="w-full h-20 bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-300 outline-none disabled:opacity-60" placeholder="Ex : bilan biologique complémentaire nécessaire avant de statuer sur l'aptitude..." />
                  </div>
                )}
                {/* Mention informelle : pas un vrai workflow d'approbation, juste un aperçu si le
                    Prof/chef de service a donné son accord par un simple appel téléphonique. */}
                <div className="mt-3 pt-3 border-t border-amber-200/60">
                  <label className="text-[11px] font-bold text-amber-800 block mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">call</span> Validation informelle du Prof (optionnel)
                  </label>
                  <input disabled={!peutEditerExamenEtDecision} value={validationProfInformelle} onChange={e => setValidationProfInformelle(e.target.value)}
                    className="w-full bg-white border border-amber-200 rounded-lg p-2 text-xs disabled:opacity-60"
                    placeholder="Ex : validé par téléphone par le Pr Rakoto le 22/07 à 14h" />
                </div>
              </div>
            </div>
          </div>

          {historiqueCpa.length > 0 && (
            <div className="mt-3 rounded-2xl border border-outline-variant/40 bg-white overflow-hidden">
              <button type="button" onClick={() => setOngletHistorique(v => !v)}
                className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">history</span>
                <span className="text-sm font-bold text-on-surface">Historique des CPA précédentes</span>
                <span className="ml-1 px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-extrabold rounded-full">{historiqueCpa.length}</span>
                <span className="material-symbols-outlined ml-auto text-on-surface-variant">{ongletHistorique ? 'expand_less' : 'expand_more'}</span>
              </button>
              {ongletHistorique && (
                <div className="px-4 pb-4 space-y-2">
                  {historiqueCpa.map((h: any) => (
                    <div key={h.id} className="p-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{h.dateConsultation ? new Date(h.dateConsultation).toLocaleDateString('fr-FR') : '—'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          h.decision === 'APTE' ? 'bg-emerald-100 text-emerald-700' : h.decision === 'INAPTE' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>{h.decision === 'REPORT' ? 'CPA reportée' : h.decision}</span>
                      </div>
                      {h.motifRefus && <p className="text-xs text-on-surface-variant">Motif : {h.motifRefus}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Planification de la vérification à la veille — réservée à l'anesthésiste, sans objet
              pour un patient urgent (chirurgie immédiate, pas de "veille") */}
          {!estUrgent && decision !== 'INAPTE' && decision !== '' && (
            <div className="mt-4 p-4 bg-surface-container-low rounded-xl border space-y-2">
              <label className="text-sm font-bold block">Planification de la vérification à la veille de l'opération</label>
              <p className="text-xs text-on-surface-variant mb-1">Contrôle final réalisé la veille de l'intervention, avant le passage au bloc — planifié par l'anesthésiste.</p>
              {!peutEditerMedicamentsEtVpa && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  Réservé à l'anesthésiste{roleName ? ` (votre rôle : ${roleName})` : ''}.
                </div>
              )}
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <input disabled={!peutEditerMedicamentsEtVpa} className="flex-1 bg-white border-none rounded-lg p-2 text-sm disabled:opacity-60" type="date" value={dateVPA} onChange={e => setDateVPA(e.target.value)} />
                <input disabled={!peutEditerMedicamentsEtVpa} className="flex-none w-32 bg-white border-none rounded-lg p-2 text-sm disabled:opacity-60" type="time" value={heureVPA} onChange={e => setHeureVPA(e.target.value)} />
              </div>
            </div>
          )}

          {/* Bouton Valider */}
          <div className="mt-4 pt-4 border-t border-surface-container flex justify-end">
            {(() => {
              const peutSoumettre = cpaDejaRemplie ? peutEditerMedicamentsEtVpa : peutEditerExamenEtDecision;
              const libelle = loading
                ? (cpaDejaRemplie ? 'Enregistrement...' : 'Validation...')
                : !peutSoumettre
                  ? 'Accès non autorisé'
                  : cpaDejaRemplie
                    ? 'Enregistrer les médicaments et la vérification veille'
                    : 'Valider';
              return (
                <button onClick={handleValider} disabled={loading || chargementCpa || !peutSoumettre}
                  className="px-8 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50">
                  {libelle}
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    </main>
  );
}
