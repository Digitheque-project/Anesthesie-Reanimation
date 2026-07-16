'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { patientService, planningService, medecinService } from '@/lib/api';
import { apiClient } from '@/lib/api/client';

export default function ConsultationCpaPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ConsultationCpaPageContent />
    </Suspense>
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
  alcool: 'Occasionnel / Aucun',
  typeAnesthesie: 'Anesthésie Générale (AG)',
  techniqueIntubation: 'Sonde Endotrachéale',
  jeune: '',
  preparationPhysique: '',
  tachesInfirmieres: '',
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
  const [anesthesistes, setAnesthesistes] = useState<any[]>([]);
  const [anesthesisteId, setAnesthesisteId] = useState('');
  const [form, setForm] = useState(DEFAULT_FORM);
  const [scoreMallampati, setScoreMallampati] = useState<number>(1);
  const [scoreASA, setScoreASA] = useState<number | string>(1);
  const [decision, setDecision] = useState<'APTE' | 'INAPTE' | 'REPORT' | ''>('');
  const [motifRefus, setMotifRefus] = useState('');
  const [dateVPA, setDateVPA] = useState('');
  const [heureVPA, setHeureVPA] = useState('08:00');
  const [loading, setLoading] = useState(false);
  const [showMedicamentModal, setShowMedicamentModal] = useState(false);
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [nouveauMedicament, setNouveauMedicament] = useState({ premedication: '', dose: '', voieAdmin: '', debut: '', frequence: '' });

  useEffect(() => {
    if (patientId) {
      patientService.getById(patientId).then(setPatient).catch(console.error);
    }
    medecinService.getAll({ role: 'ANESTHESISTE', limite: 100 }).then((data: any) => {
      setAnesthesistes(Array.isArray(data) ? data : data?.data || []);
    }).catch(console.error);
  }, [patientId]);

  const estUrgent = patient?.niveauUrgence === 'URGENT' || patient?.niveauUrgence === 'STAT';

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

  const handleValider = async () => {
    const patientIdFinal = patientId || patient?.id;
    if (!patientIdFinal) { alert('❌ Patient introuvable'); return; }
    if (!anesthesisteId) { alert('❌ Sélectionnez l\'anesthésiste ayant réalisé la consultation'); return; }
    if (!decision) { alert('❌ Sélectionnez une décision (Apte / Inapte / Report)'); return; }
    if (decision === 'INAPTE' && !motifRefus.trim()) { alert('❌ Le motif du refus est obligatoire'); return; }
    const nombresRequis: [string, string][] = [
      [form.frequenceCardiaque, 'Fréquence cardiaque'],
      [form.taSystolique, 'TA systolique'],
      [form.taDiastolique, 'TA diastolique'],
      [form.taille, 'Taille'],
      [form.poids, 'Poids'],
      [form.ouvertureBuccale, 'Ouverture buccale'],
      [form.distanceMentoThyroidienne, 'Distance mento-thyroïdienne'],
    ];
    for (const [valeur, label] of nombresRequis) {
      if (valeur === '' || isNaN(Number(valeur))) { alert(`❌ Champ requis manquant ou invalide : ${label}`); return; }
    }

    setLoading(true);
    try {
      const payload = {
        patientId: patientIdFinal,
        anesthesisteId,
        dateConsultation: new Date().toISOString().split('T')[0],
        antecedentsAnesthesie: form.antecedentsAnesthesie,
        notesIncidents: form.notesIncidents || undefined,
        frequenceCardiaque: Number(form.frequenceCardiaque),
        tensionArterielle: { systolique: Number(form.taSystolique), diastolique: Number(form.taDiastolique) },
        taille: Number(form.taille),
        poids: Number(form.poids),
        examenCardiovasculaire: form.examenCardiovasculaire || 'RAS',
        examenPulmonaire: form.examenPulmonaire || 'RAS',
        examenNeurologique: form.examenNeurologique || 'RAS',
        colorationConjonctivale: form.colorationConjonctivale,
        abordVeineux: form.abordVeineux || 'RAS',
        rachis: form.rachis || 'RAS',
        mallampati: scoreMallampati,
        ouvertureBuccale: Number(form.ouvertureBuccale),
        distanceMentoThyroidienne: Number(form.distanceMentoThyroidienne),
        dents: form.dents,
        tabac: form.tabac,
        alcool: form.alcool,
        scoreASA: typeof scoreASA === 'string' ? scoreASA : Number(scoreASA),
        decision,
        motifRefus: decision === 'INAPTE' ? motifRefus.trim() : undefined,
        typeAnesthesie: form.typeAnesthesie,
        techniqueIntubation: form.techniqueIntubation,
        premedicaments: medicaments.map(m => ({
          nom: m.premedication,
          dose: m.dose,
          voieAdministration: m.voieAdmin,
          debut: m.debut || 'H-1',
          frequence: m.frequence || '1x/jour'
        })),
        jeune: form.jeune || 'À partir de minuit',
        preparationPhysique: form.preparationPhysique || 'RAS',
        tachesInfirmieres: form.tachesInfirmieres || 'RAS',
        dateVPA: decision !== 'INAPTE' && dateVPA ? dateVPA : undefined,
      };

      await apiClient.post('/cpa', payload);

      if (decision !== 'INAPTE' && dateVPA) {
        const [h, m] = heureVPA.split(':').map(Number);
        const fin = new Date(); fin.setHours(h, m + 30);
        await planningService.reserverCreneau({
          patientId: patientIdFinal,
          date: dateVPA,
          heureDebut: heureVPA,
          heureFin: fin.toTimeString().split(' ')[0].substring(0, 5),
          salle: 'VPA-1',
          estUrgence: estUrgent || false,
          type: 'VPA',
        });
      }

      alert('✅ CPA validée avec succès !');
      router.push('/bloc/rendez-vous/vpa');
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
      {/* Patient Context Header */}
      <div className="bg-surface-bright rounded-xl p-4 flex flex-wrap items-center justify-between shadow-sm border border-white/50">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">account_circle</span>
          </div>
          <div>
            <h1 className="text-xl font-bold font-headline text-on-surface">{patientNom}</h1>
            <p className="text-sm text-on-surface-variant">{patientAge ? `${patientAge} ans` : ''}{patientIpp ? ` • IPP: ${patientIpp}` : ''}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => router.push(`/bloc/dossier-patient/${patientId}`)}
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

      {/* Anesthésiste réalisant la consultation */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
        <label className="text-sm font-semibold block mb-2">Anesthésiste réalisant la consultation *</label>
        <select value={anesthesisteId} onChange={e => setAnesthesisteId(e.target.value)}
          className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm">
          <option value="">— Sélectionner —</option>
          {anesthesistes.map((m: any) => (
            <option key={m.id} value={m.id}>{m.nom} {m.prenom}</option>
          ))}
        </select>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex flex-col lg:flex-row gap-2">
        {/* COLONNE GAUCHE */}
        <div className="flex-1 space-y-2">
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
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container transition-colors has-[:checked]:bg-primary-fixed has-[:checked]:border-primary">
                    <input checked={form.antecedentsAnesthesie} onChange={() => setForm(f => ({ ...f, antecedentsAnesthesie: true }))} className="hidden" name="history" type="radio" /><span className="text-sm font-bold">OUI</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container transition-colors has-[:checked]:bg-primary-fixed has-[:checked]:border-primary">
                    <input checked={!form.antecedentsAnesthesie} onChange={() => setForm(f => ({ ...f, antecedentsAnesthesie: false }))} className="hidden" name="history" type="radio" /><span className="text-sm font-bold">NON</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant">Notes d'incidents</label>
                <textarea value={form.notesIncidents} onChange={setField('notesIncidents')} className="w-full h-24 bg-surface-container-low border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20" placeholder="Décrire tout incident..."></textarea>
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
                  <div><label className="text-[10px] font-bold block mb-1">Fréquence Cardiaque (BPM) *</label><input value={form.frequenceCardiaque} onChange={setField('frequenceCardiaque')} className="w-full bg-white border-none rounded-lg p-2 text-lg font-bold text-primary" type="number" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-[10px] font-bold block mb-1">TA Syst. *</label><input value={form.taSystolique} onChange={setField('taSystolique')} className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold" type="number" /></div>
                    <div><label className="text-[10px] font-bold block mb-1">TA Diast. *</label><input value={form.taDiastolique} onChange={setField('taDiastolique')} className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold" type="number" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-[10px] font-bold block mb-1">Taille (cm) *</label><input value={form.taille} onChange={setField('taille')} className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold" placeholder="170" type="number" /></div>
                    <div><label className="text-[10px] font-bold block mb-1">Poids (kg) *</label><input value={form.poids} onChange={setField('poids')} className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold" placeholder="70" type="number" /></div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-5 grid grid-cols-1 gap-3">
                <div><label className="text-xs font-bold uppercase tracking-tighter">Cardio-vasculaire</label><textarea value={form.examenCardiovasculaire} onChange={setField('examenCardiovasculaire')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20" placeholder="Bruit du coeur..."></textarea></div>
                <div><label className="text-xs font-bold uppercase tracking-tighter">Pulmonaire</label><textarea value={form.examenPulmonaire} onChange={setField('examenPulmonaire')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20" placeholder="Murmure vésiculaire..."></textarea></div>
                <div><label className="text-xs font-bold uppercase tracking-tighter">Neurologique</label><textarea value={form.examenNeurologique} onChange={setField('examenNeurologique')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20" placeholder="Etat de conscience..."></textarea></div>
              </div>
              <div className="md:col-span-4 grid grid-cols-1 gap-3">
                <div><label className="text-xs font-bold uppercase tracking-tighter">Coloration Conjonctivale</label>
                  <select value={form.colorationConjonctivale} onChange={setField('colorationConjonctivale')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm">
                    <option>Normale (Rose)</option><option>Pâleur</option><option>Ictère</option><option>Congestion</option>
                  </select>
                </div>
                <div><label className="text-xs font-bold uppercase tracking-tighter">Abords veineux</label><textarea value={form.abordVeineux} onChange={setField('abordVeineux')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20" placeholder="Qualité du réseau..."></textarea></div>
                <div><label className="text-xs font-bold uppercase tracking-tighter">Rachis</label><textarea value={form.rachis} onChange={setField('rachis')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20" placeholder="Mobilité, déformation..."></textarea></div>
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
                    <button key={score} onClick={() => setScoreMallampati(score)}
                      className={`p-3 rounded-lg border font-bold text-sm transition-all ${scoreMallampati === score ? 'border-primary bg-primary-fixed text-primary' : 'border-outline-variant bg-white hover:bg-primary-fixed'}`}>
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2"><label className="text-sm font-semibold block">Ouverture buccale *</label><div className="relative"><input value={form.ouvertureBuccale} onChange={setField('ouvertureBuccale')} className="w-full bg-surface-container-low border-none rounded-xl p-3 pr-10 text-sm" placeholder="cm" type="number" /><span className="absolute right-3 top-3 text-xs font-bold">CM</span></div></div>
              <div className="space-y-2"><label className="text-sm font-semibold block">DMTC *</label><div className="relative"><input value={form.distanceMentoThyroidienne} onChange={setField('distanceMentoThyroidienne')} className="w-full bg-surface-container-low border-none rounded-xl p-3 pr-10 text-sm" placeholder="cm" type="number" /><span className="absolute right-3 top-3 text-xs font-bold">CM</span></div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 border-t border-outline-variant/20 pt-4">
              <div className="space-y-2"><label className="text-sm font-semibold uppercase tracking-widest text-[10px]">DENTS</label>
                <select value={form.dents} onChange={setField('dents')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm">
                  <option>Denture saine</option><option>Prothèse amovible</option><option>Dents fragiles/mobiles</option>
                </select>
              </div>
              <div className="space-y-2"><label className="text-sm font-semibold uppercase tracking-widest text-[10px]">TABAC</label>
                <select value={form.tabac} onChange={setField('tabac')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm">
                  <option>Non fumeur</option><option>Fumeur actif</option><option>Ancien fumeur</option>
                </select>
              </div>
              <div className="space-y-2"><label className="text-sm font-semibold uppercase tracking-widest text-[10px]">ALCOOLS</label>
                <select value={form.alcool} onChange={setField('alcool')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm">
                  <option>Occasionnel / Aucun</option><option>Régulier</option><option>Chronique / Sevrage</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* COLONNE DROITE */}
        <div className="w-full lg:w-80 space-y-2">
          <section className="bg-primary-container text-on-primary rounded-2xl p-4 shadow-lg shadow-primary/20">
            <h2 className="text-lg font-bold font-headline mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>award_star</span> Score ASA
            </h2>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[1, 2, 3, 4, 5, 6].map((score) => (
                <button key={score} onClick={() => setScoreASA(score)}
                  className={`aspect-square rounded-xl font-bold transition-all ${scoreASA === score ? 'bg-white text-primary shadow-md scale-105' : 'bg-white/20 hover:bg-white/40'}`}>
                  {score}
                </button>
              ))}
              <button onClick={() => setScoreASA('E')}
                className={`col-span-2 aspect-[2/1] rounded-xl font-bold transition-all ${scoreASA === 'E' ? 'bg-white text-primary shadow-md scale-105' : 'bg-tertiary-container/40 hover:bg-tertiary-container/60'}`}>
                ASA E
              </button>
            </div>
            <p className="text-[10px] text-white/70 uppercase font-bold text-center">Patient avec pathologie systémique sévère</p>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Décision Finale *</h2>
            <div className="space-y-2">
              {[
                { key: 'APTE', label: "Apte à l'anesthésie", activeClass: 'bg-secondary/10 border-secondary text-secondary' },
                { key: 'INAPTE', label: 'Inapte à ce jour', activeClass: 'bg-error/10 border-error text-error' },
                { key: 'REPORT', label: "Report d'intervention", activeClass: 'bg-tertiary/10 border-tertiary text-tertiary' },
              ].map(opt => (
                <button key={opt.key} onClick={() => setDecision(opt.key as any)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    decision === opt.key ? opt.activeClass : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}>
                  <span className="font-bold">{opt.label}</span>
                  {decision === opt.key && <span className="material-symbols-outlined">check_circle</span>}
                </button>
              ))}
            </div>
            {decision === 'INAPTE' && (
              <div className="mt-3">
                <label className="text-xs font-bold block mb-1">Motif du refus *</label>
                <textarea value={motifRefus} onChange={e => setMotifRefus(e.target.value)}
                  className="w-full h-20 bg-surface-container-low border-none rounded-xl p-3 text-sm" placeholder="Expliquez le motif de l'inaptitude..." />
              </div>
            )}
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-2">
            <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Protocole retenu</h2>
            <div><label className="text-[10px] font-bold block mb-2">Type d'anesthésie</label>
              <select value={form.typeAnesthesie} onChange={setField('typeAnesthesie')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm">
                <option>Anesthésie Générale (AG)</option><option>Rachianesthésie</option><option>ALR</option><option>Sédation</option>
              </select>
            </div>
            <div><label className="text-[10px] font-bold block mb-2">Technique d'intubation</label>
              <select value={form.techniqueIntubation} onChange={setField('techniqueIntubation')} className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm">
                <option>Sonde Endotrachéale</option><option>Masque Laryngé</option><option>IOT Séquence Rapide</option>
              </select>
            </div>
          </section>
        </div>
      </div>

      {/* Instructions & Prescription */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-surface-container">
          <button className="px-8 py-4 text-primary font-bold border-b-2 border-primary bg-primary-fixed/30 flex-1 text-center">Instructions Pré-opératoires</button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">pill</span> Prémédication</h3>
              <div className="overflow-hidden border border-surface-container rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container text-[10px] uppercase font-bold text-on-surface-variant">
                    <tr><th className="px-4 py-3">Prémédication</th><th className="px-4 py-3">Dose</th><th className="px-4 py-3">Voie d'Admin</th><th className="px-4 py-3">Début</th><th className="px-4 py-3">Fréquence</th><th className="px-4 py-3">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {medicaments.map((med, i) => (
                      <tr key={i} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-3 font-semibold">{med.premedication}</td><td className="px-4 py-3">{med.dose}</td><td className="px-4 py-3">{med.voieAdmin}</td><td className="px-4 py-3">{med.debut || '-'}</td><td className="px-4 py-3">{med.frequence || '-'}</td>
                        <td className="px-4 py-3"><button onClick={() => supprimerMedicament(i)} className="text-error"><span className="material-symbols-outlined text-sm">delete</span></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={() => setShowMedicamentModal(true)} className="w-full py-3 text-xs font-bold text-primary hover:bg-primary-fixed/20 transition-colors">+ AJOUTER UN MÉDICAMENT</button>
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

              <div className="mt-4 space-y-2">
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider">Jeûne</label><textarea value={form.jeune} onChange={setField('jeune')} className="w-full h-20 bg-surface-container-low border-none rounded-xl p-3 text-sm" placeholder="Instructions spécifiques..."></textarea></div>
                <div className="bg-surface-container-low rounded-xl p-4 border-l-4 border-secondary"><h3 className="text-sm font-bold text-secondary flex items-center gap-2 mb-2"><span className="material-symbols-outlined">no_food</span>Règles de jeûne</h3><div className="grid grid-cols-2 gap-2"><div className="bg-white p-3 rounded-lg"><p className="text-[10px] font-bold uppercase">Solides</p><p className="text-sm font-bold">À partir de minuit</p></div><div className="bg-white p-3 rounded-lg"><p className="text-[10px] font-bold uppercase">Liquides Clairs</p><p className="text-sm font-bold">Jusqu'à H-2</p></div></div></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider">Préparation physique</label><textarea value={form.preparationPhysique} onChange={setField('preparationPhysique')} className="w-full h-20 bg-surface-container-low border-none rounded-xl p-3 text-sm" placeholder="Douche, dépilation..."></textarea></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider">Tâches soignantes</label><textarea value={form.tachesInfirmieres} onChange={setField('tachesInfirmieres')} className="w-full h-20 bg-surface-container-low border-none rounded-xl p-3 text-sm" placeholder="Surveillance, constantes..."></textarea></div>
              </div>
            </div>
          </div>

          {/* Date VPA */}
          {decision !== 'INAPTE' && (
            <div className="mt-4 p-4 bg-surface-container-low rounded-xl border space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="text-sm font-bold whitespace-nowrap">Date du VPA de ce Patient</label>
                <input className="flex-1 bg-white border-none rounded-lg p-2 text-sm" type="date" value={dateVPA} onChange={e => setDateVPA(e.target.value)} />
                <input className="flex-none w-32 bg-white border-none rounded-lg p-2 text-sm" type="time" value={heureVPA} onChange={e => setHeureVPA(e.target.value)} />
              </div>
            </div>
          )}

          {/* Bouton Valider */}
          <div className="mt-4 pt-4 border-t border-surface-container flex justify-end">
            <button onClick={handleValider} disabled={loading}
              className="px-8 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50">
              {loading ? 'Validation...' : 'Valider'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
