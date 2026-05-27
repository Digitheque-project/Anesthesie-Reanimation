'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { patientService, planningService } from '@/lib/api';
import { apiClient } from '@/lib/api/client';

export default function ConsultationCpaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get('patientId') || '';
  const patientNom = searchParams.get('patientNom') || 'DUPONT, Jean-Marc';
  const patientIpp = searchParams.get('patientIpp') || '8293011';
  const patientAge = searchParams.get('patientAge') ? parseInt(searchParams.get('patientAge')!) : 51;
  const intervention = searchParams.get('intervention') || 'Chirurgie Valvulaire Mitrale';

  const [patient, setPatient] = useState<any>(null);
  const [scoreMallampati, setScoreMallampati] = useState<number>(2);
  const [scoreASA, setScoreASA] = useState<number | string>(3);
  const [dateVPA, setDateVPA] = useState('');
  const [heureVPA, setHeureVPA] = useState('08:00');
  const [loading, setLoading] = useState(false);
  const [showMedicamentModal, setShowMedicamentModal] = useState(false);
  const [medicaments, setMedicaments] = useState<any[]>([
    { premedication: 'Atarax', dose: '25mg', voieAdmin: 'Per os (Veille)', debut: '', frequence: '' },
    { premedication: 'Paracétamol IV', dose: '1g', voieAdmin: 'J-0 Preop', debut: '', frequence: '' },
  ]);
  const [nouveauMedicament, setNouveauMedicament] = useState({ premedication: '', dose: '', voieAdmin: '', debut: '', frequence: '' });

  useEffect(() => {
    if (patientId) patientService.getById(patientId).then(setPatient).catch(console.error);
  }, [patientId]);

  const estUrgent = patient?.niveauUrgence === 'URGENT' || patient?.niveauUrgence === 'STAT';

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
    setLoading(true);
    try {
      await apiClient.post('/cpa', {
        patientId: patientId || patient?.id,
        anesthesisteId: 'b2ad830a-82a4-40da-a2f0-9bea28cfac52',
        dateConsultation: new Date().toISOString().split('T')[0],
        frequenceCardiaque: 72,
        tensionArterielle: { systolique: 120, diastolique: 80 },
        taille: 170, poids: 70,
        examenCardiovasculaire: 'Normal', examenPulmonaire: 'Normal', examenNeurologique: 'Normal',
        colorationConjonctivale: 'Normale', abordVeineux: 'Bon', rachis: 'Normal',
        mallampati: scoreMallampati, ouvertureBuccale: 4, distanceMentoThyroidienne: 6,
        dents: 'Denture saine', tabac: 'Non fumeur', alcool: 'Occasionnel',
        scoreASA: scoreASA, decision: 'APTE',
        typeAnesthesie: 'Anesthésie Générale (AG)', techniqueIntubation: 'Sonde Endotrachéale',
        jeune: 'À partir de minuit', preparationPhysique: 'Douche bétadinée', tachesInfirmieres: 'Constantes',
        antecedentsAnesthesie: true,
        premedicaments: medicaments.map(m => ({
          nom: m.premedication, dose: m.dose,
          voieAdministration: m.voieAdmin, debut: m.debut, frequence: m.frequence
        })),
        dateVPA: dateVPA || undefined
      });

      if (dateVPA) {
        await planningService.reserverCreneau({
          patientId: patientId || patient?.id,
          chirurgienId: '533a405a-ebd7-4320-bac5-a5578f044575',
          date: dateVPA, heureDebut: heureVPA, heureFin: heureVPA,
          salle: 'VPA-1', estUrgence: estUrgent, type: 'VPA'
        });
      }

      alert('✅ CPA validée avec succès !');
      router.push('/bloc/rendez-vous/vpa');
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 space-y-2">
      {/* Top Header Info */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-bold text-primary uppercase tracking-widest">Consultation Pré-Anesthésique</h2>
          <p className="text-[10px] text-on-surface-variant font-medium">Formulaire de consultation CPA</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-surface-container rounded-full transition-all">
            <span className="material-symbols-outlined text-primary text-xl">notifications</span>
          </button>
          <button className="p-2 hover:bg-surface-container rounded-full transition-all">
            <span className="material-symbols-outlined text-primary text-xl">settings</span>
          </button>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface leading-tight">Dr. A. Durand</p>
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-tighter">Anesthésiste-Réanimateur</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden ring-2 ring-primary/10">
              <img alt="Profil" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz3FBTArJjHC4hhRtO_WiBSJAtzalEMR3asIo8WJSaC8GDPTapedVSbCrv5sSsGLC2oq3VLV_SwFIJru5Qc5uwMrfZJdPxSnxoe1zNc8dSQxm6bWF6BcZInCcJmWFoAT2DosUa0rQXenbw_LRpl86yUU9Rj82fNLMjYKTq02-av05pOyVLfYAJvs84zzo9ygELcRgrHSemPusliRRt8Fm6lcpiKWCwEUVkq4ctC84F2OOTHGgqlunZDZUq3rOMa0kxkElTpKTrS60" />
            </div>
          </div>
        </div>
      </div>

      {/* Patient Context Header */}
      <div className="sticky top-0 z-30 bg-surface-bright/80 backdrop-blur-lg rounded-xl p-4 flex flex-wrap items-center justify-between shadow-sm border border-white/50">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">account_circle</span>
          </div>
          <div>
            <h1 className="text-xl font-bold font-headline text-on-surface">{patientNom}</h1>
            <p className="text-sm text-on-surface-variant">Né le 12/05/1972 ({patientAge} ans) • IPP: {patientIpp}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/bloc/dossier-patient/${patientId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-all">
            <span className="material-symbols-outlined text-lg">folder_open</span> Voir dossier
          </button>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Intervention prévue</p>
            <p className="text-sm font-semibold text-primary">{intervention}</p>
          </div>
          <div className="h-10 w-[1px] bg-outline-variant/30 hidden sm:block"></div>
          <div className="flex flex-col items-center">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${estUrgent ? 'bg-red-100 text-red-700' : 'bg-secondary/10 text-secondary'}`}>
              {estUrgent ? 'NON PROGRAMMÉ' : 'PROGRAMMÉ'}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL : Antécédents + Examen clinique + Voies aériennes À GAUCHE, ASA + Décision + Protocole À DROITE */}
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
                    <input defaultChecked className="hidden" name="history" type="radio" /><span className="text-sm font-bold">OUI</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container transition-colors has-[:checked]:bg-primary-fixed has-[:checked]:border-primary">
                    <input className="hidden" name="history" type="radio" /><span className="text-sm font-bold">NON</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant">Notes d'incidents</label>
                <textarea className="w-full h-24 bg-surface-container-low border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20" placeholder="Décrire tout incident..."></textarea>
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
                  <div><label className="text-[10px] font-bold block mb-1">Fréquence Cardiaque (BPM)</label><input className="w-full bg-white border-none rounded-lg p-2 text-lg font-bold text-primary" type="number" defaultValue="72" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-[10px] font-bold block mb-1">TA Syst.</label><input className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold" type="number" defaultValue="120" /></div>
                    <div><label className="text-[10px] font-bold block mb-1">TA Diast.</label><input className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold" type="number" defaultValue="80" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-[10px] font-bold block mb-1">Taille (cm)</label><input className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold" placeholder="170" type="number" /></div>
                    <div><label className="text-[10px] font-bold block mb-1">Poids (kg)</label><input className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold" placeholder="70" type="number" /></div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-5 grid grid-cols-1 gap-3">
                <div><label className="text-xs font-bold uppercase tracking-tighter">Cardio-vasculaire</label><textarea className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20" placeholder="Bruit du coeur..."></textarea></div>
                <div><label className="text-xs font-bold uppercase tracking-tighter">Pulmonaire</label><textarea className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20" placeholder="Murmure vésiculaire..."></textarea></div>
                <div><label className="text-xs font-bold uppercase tracking-tighter">Neurologique</label><textarea className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20" placeholder="Etat de conscience..."></textarea></div>
              </div>
              <div className="md:col-span-4 grid grid-cols-1 gap-3">
                <div><label className="text-xs font-bold uppercase tracking-tighter">Coloration Conjonctivale</label><select className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm"><option>Normale (Rose)</option><option>Pâleur</option><option>Ictère</option><option>Congestion</option></select></div>
                <div><label className="text-xs font-bold uppercase tracking-tighter">Abords veineux</label><textarea className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20" placeholder="Qualité du réseau..."></textarea></div>
                <div><label className="text-xs font-bold uppercase tracking-tighter">Rachis</label><textarea className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm h-20" placeholder="Mobilité, déformation..."></textarea></div>
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
              <div className="space-y-2"><label className="text-sm font-semibold block">Ouverture buccale</label><div className="relative"><input className="w-full bg-surface-container-low border-none rounded-xl p-3 pr-10 text-sm" placeholder="cm" type="number" /><span className="absolute right-3 top-3 text-xs font-bold">CM</span></div></div>
              <div className="space-y-2"><label className="text-sm font-semibold block">DMTC</label><div className="relative"><input className="w-full bg-surface-container-low border-none rounded-xl p-3 pr-10 text-sm" placeholder="cm" type="number" /><span className="absolute right-3 top-3 text-xs font-bold">CM</span></div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 border-t border-outline-variant/20 pt-4">
              <div className="space-y-2"><label className="text-sm font-semibold uppercase tracking-widest text-[10px]">DENTS</label><select className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm"><option>Denture saine</option><option>Prothèse amovible</option><option>Dents fragiles/mobiles</option></select></div>
              <div className="space-y-2"><label className="text-sm font-semibold uppercase tracking-widest text-[10px]">TABAC</label><select className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm"><option>Non fumeur</option><option>Fumeur actif</option><option>Ancien fumeur</option></select></div>
              <div className="space-y-2"><label className="text-sm font-semibold uppercase tracking-widest text-[10px]">ALCOOLS</label><select className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm"><option>Occasionnel / Aucun</option><option>Régulier</option><option>Chronique / Sevrage</option></select></div>
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
            <h2 className="text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Décision Finale</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary/10 border-2 border-secondary text-secondary">
                <span className="font-bold">Apte à l'anesthésie</span>
                <span className="material-symbols-outlined">check_circle</span>
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 rounded-xl border text-xs font-bold">Date maintenue</button>
                <button className="p-3 rounded-xl border text-xs font-bold">Nouvelle date</button>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-2">
            <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Protocole retenu</h2>
            <div><label className="text-[10px] font-bold block mb-2">Type d'anesthésie</label><select className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm"><option>Anesthésie Générale (AG)</option><option>Rachianesthésie</option><option>ALR</option><option>Sédation</option></select></div>
            <div><label className="text-[10px] font-bold block mb-2">Technique d'intubation</label><select className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm"><option>Sonde Endotrachéale</option><option>Masque Laryngé</option><option>IOT Séquence Rapide</option></select></div>
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
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider">Jeûne</label><textarea className="w-full h-20 bg-surface-container-low border-none rounded-xl p-3 text-sm" placeholder="Instructions spécifiques..."></textarea></div>
                <div className="bg-surface-container-low rounded-xl p-4 border-l-4 border-secondary"><h3 className="text-sm font-bold text-secondary flex items-center gap-2 mb-2"><span className="material-symbols-outlined">no_food</span>Règles de jeûne</h3><div className="grid grid-cols-2 gap-2"><div className="bg-white p-3 rounded-lg"><p className="text-[10px] font-bold uppercase">Solides</p><p className="text-sm font-bold">À partir de minuit</p></div><div className="bg-white p-3 rounded-lg"><p className="text-[10px] font-bold uppercase">Liquides Clairs</p><p className="text-sm font-bold">Jusqu'à H-2</p></div></div></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider">Préparation physique</label><textarea className="w-full h-20 bg-surface-container-low border-none rounded-xl p-3 text-sm" placeholder="Douche, dépilation..."></textarea></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider">Tâches soignantes</label><textarea className="w-full h-20 bg-surface-container-low border-none rounded-xl p-3 text-sm" placeholder="Surveillance, constantes..."></textarea></div>
              </div>
            </div>
            <div className="space-y-2">
              <div><h3 className="text-sm font-bold mb-2">Soins Infirmiers</h3><textarea className="w-full h-32 bg-surface-container-low border-none rounded-xl p-3 text-sm" placeholder="Saisir les soins infirmiers..."></textarea></div>
            </div>
          </div>

          {/* Date VPA + Équipe */}
          <div className="mt-4 p-4 bg-surface-container-low rounded-xl border space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="text-sm font-bold whitespace-nowrap">Date du VPA de ce Patient</label>
              <input className="flex-1 bg-white border-none rounded-lg p-2 text-sm" type="date" value={dateVPA} onChange={e => setDateVPA(e.target.value)} />
              <input className="flex-none w-32 bg-white border-none rounded-lg p-2 text-sm" type="time" value={heureVPA} onChange={e => setHeureVPA(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div><label className="text-[10px] font-bold block mb-1">Médecin anesthésiste-réanimateur</label><select className="w-full bg-white border rounded-lg p-2 text-sm"><option>Sélectionner...</option><option>Dr. Sophie Martin</option></select></div>
              <div><label className="text-[10px] font-bold block mb-1">Infirmier(ère) anesthésiste (IADE)</label><select className="w-full bg-white border rounded-lg p-2 text-sm"><option>Sélectionner...</option></select></div>
              <div><label className="text-[10px] font-bold block mb-1">Infirmier(ère) du bloc opératoire (IBODE)</label><select className="w-full bg-white border rounded-lg p-2 text-sm"><option>Sélectionner...</option></select></div>
              <div><label className="text-[10px] font-bold block mb-1">Infirmier(ère) de service clinique</label><select className="w-full bg-white border rounded-lg p-2 text-sm"><option>Sélectionner...</option></select></div>
              <div><label className="text-[10px] font-bold block mb-1">Chirurgien</label><select className="w-full bg-white border rounded-lg p-2 text-sm"><option>Sélectionner...</option><option>Dr. Pierre Bernard</option></select></div>
              <div><label className="text-[10px] font-bold block mb-1">Aide-soignant(e)</label><select className="w-full bg-white border rounded-lg p-2 text-sm"><option>Sélectionner...</option></select></div>
              <div><label className="text-[10px] font-bold block mb-1">Secrétaire médicale</label><select className="w-full bg-white border rounded-lg p-2 text-sm"><option>Sélectionner...</option></select></div>
            </div>
          </div>

          {/* Bouton Valider */}
          <div className="mt-4 pt-4 border-t border-surface-container flex justify-end">
            <button onClick={handleValider} disabled={loading}
              className="px-8 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 shadow-sm transition-all">
              {loading ? 'Validation...' : 'Valider'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
