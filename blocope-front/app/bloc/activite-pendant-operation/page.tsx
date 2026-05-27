'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'

export default function ActivitePendantOperationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'RADALO Jean-Pierre'
  const intervention = searchParams.get('intervention') || 'Chirurgie Digestive'

  const [form, setForm] = useState({
    dateOperation: new Date().toISOString().split('T')[0],
    chirurgienId: '', anesthesisteId: '',
    perfusions: '', transfusions: '', journalSorties: '',
    fc: '', ta: '', spo2: '', spo3: '', score: '', capnie: '', temperature: '',
    intubationOT: false, sArme: false, masqueLarynge: false,
    ventilationSpontanee: '', ventilationAssistee: '', ventilationControlee: '', ventilationPEEP: '', ventilationCircuitFerme: '',
    etatArrivee: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const constantes = [{
        heure: new Date().toTimeString().split(' ')[0],
        fc: Number(form.fc) || 0, ta: form.ta || '0/0', spo2: Number(form.spo2) || 0,
        temperature: Number(form.temperature) || 0, capnie: Number(form.capnie) || 0, score: Number(form.score) || 0
      }]
      await apiClient.post('/activites-per-op', {
        patientId, chirurgienId: '', anesthesisteId: '',
        dateOperation: form.dateOperation,
        perfusions: form.perfusions, transfusions: form.transfusions, journalSorties: form.journalSorties,
        intubationOT: form.intubationOT, sArme: form.sArme, masqueLarynge: form.masqueLarynge,
        ventilation: {
          spontanee: form.ventilationSpontanee, assistee: form.ventilationAssistee,
          controlee: form.ventilationControlee, peep: form.ventilationPEEP, circuitFerme: form.ventilationCircuitFerme
        },
        constantes,
        etatArrivee: form.etatArrivee ? [form.etatArrivee] : []
      })
      alert('✅ Activité enregistrée !')
      router.push('/bloc/protocole-operatoire?patientId=' + patientId + '&patientNom=' + encodeURIComponent(patientNom))
    } catch (err) { console.error(err); alert('❌ Erreur') }
    finally { setLoading(false) }
  }

  const ETATS = ['CALME', 'DETENDU', 'ANXIEUX', 'AGITE']

  return (
    <main className="p-6">
      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-xl z-50 sticky top-0 border-b border-surface-container-highest shadow-sm flex justify-between items-center w-full px-6 py-2">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-0.5">Patient en cours</span>
            <h2 className="font-headline font-bold text-lg text-on-surface leading-tight">{patientNom}</h2>
          </div>
          <div className="h-10 w-px bg-surface-container-highest"></div>
          <div className="grid grid-cols-4 gap-x-8 gap-y-1">
            <div><p className="text-[9px] text-on-surface-variant font-semibold uppercase tracking-tighter">ID / MRN</p><p className="font-label text-xs font-bold text-on-surface">#982-CH-2024</p></div>
            <div><p className="text-[9px] text-on-surface-variant font-semibold uppercase tracking-tighter">Opération</p><p className="font-label text-xs font-bold text-on-surface truncate">{intervention}</p></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Retour
          </button>
          <div className="bg-tertiary/10 text-tertiary px-3 py-1.5 rounded-full flex items-center gap-2 border border-tertiary/20">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span></span>
            <span className="text-[10px] font-extrabold tracking-wider">PROCÉDURE EN COURS</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        {/* Section 1: APPORTS */}
        <section className="bg-white rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
          <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">input</span>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">APPORTS (ENTRÉES)</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">PERFUSIONS</label><textarea className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" rows={3} placeholder="Saisir les détails..." value={form.perfusions} onChange={e => setForm({...form, perfusions: e.target.value})}></textarea></div>
            <div className="space-y-2"><label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">TRANSFUSIONS</label><textarea className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" rows={3} placeholder="Saisir les détails..." value={form.transfusions} onChange={e => setForm({...form, transfusions: e.target.value})}></textarea></div>
          </div>
        </section>

        {/* Section 2: SORTIES */}
        <section className="bg-white rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
          <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">output</span>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">SORTIES</h3>
          </div>
          <div className="p-6"><div className="space-y-2"><label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">JOURNAL DES SORTIES</label><textarea className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-4 text-sm focus:ring-2 focus:ring-primary outline-none" rows={4} placeholder="Quantifier et décrire..." value={form.journalSorties} onChange={e => setForm({...form, journalSorties: e.target.value})}></textarea></div></div>
        </section>

        {/* Section 3: SURVEILLANCE DES CONSTANTES */}
        <section className="bg-white rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
          <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">monitoring</span>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">SURVEILLANCE DES CONSTANTES</h3>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { label: 'FC (BPM)', key: 'fc' }, { label: 'TA (MMHG)', key: 'ta' }, { label: 'SPO2 (%)', key: 'spo2' },
              { label: 'SPO3 (%)', key: 'spo3' }, { label: 'SCORE', key: 'score' }, { label: 'CAPNIE', key: 'capnie' }, { label: 'TEMPÉRATURE (°C)', key: 'temperature' }
            ].map(item => (
              <div key={item.key} className="space-y-1.5">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase">{item.label}</label>
                <input className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary outline-none" placeholder="--" type="text" value={form[item.key as keyof typeof form] as string} onChange={e => setForm({...form, [item.key]: e.target.value})} />
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: VENTILATION */}
        <section className="bg-white rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
          <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">ventilator</span>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">VENTILATION</h3>
          </div>
          <div className="p-6"><div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: 'intubationOT', label: 'INTUB - OT' }, { key: 'sArme', label: 'S.ARMEE' }, { key: 'masqueLarynge', label: 'M.LARYNCE' }
            ].map(item => (
              <div key={item.key} className="flex items-center gap-4 bg-background p-4 rounded-lg border border-surface-container-highest">
                <input className="w-5 h-5 text-primary border-outline-variant rounded focus:ring-primary cursor-pointer" type="checkbox" checked={form[item.key as keyof typeof form] as boolean} onChange={e => setForm({...form, [item.key]: e.target.checked})} />
                <span className="text-xs font-bold text-on-surface uppercase">{item.label}</span>
              </div>
            ))}
          </div></div>
        </section>

        {/* Section 5: OPTIONS DE VENTILATION */}
        <section className="bg-white rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
          <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">settings_input_component</span>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">OPTIONS DE VENTILATION</h3>
          </div>
          <div className="p-6"><div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { label: 'Spontanée', key: 'ventilationSpontanee' }, { label: 'Assistée', key: 'ventilationAssistee' },
              { label: 'Controlée', key: 'ventilationControlee' }, { label: 'PEEP', key: 'ventilationPEEP' }, { label: 'Circuit fermé', key: 'ventilationCircuitFerme' }
            ].map(item => (
              <div key={item.key} className="flex flex-col gap-2">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</label>
                <input className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Détails..." type="text" value={form[item.key as keyof typeof form] as string} onChange={e => setForm({...form, [item.key]: e.target.value})} />
              </div>
            ))}
          </div></div>
        </section>

        {/* Section 6: PATIENT À L'ARRIVÉE */}
        <section className="bg-white rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
          <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">psychology</span>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">PATIENT À L'ARRIVÉE</h3>
          </div>
          <div className="p-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ETATS.map(etat => (
              <label key={etat} className={`flex items-center justify-center gap-4 p-5 bg-background rounded-xl border-2 cursor-pointer hover:bg-surface-container-low transition-all group ${form.etatArrivee === etat ? 'border-primary bg-primary/5' : 'border-surface-container-highest'}`}>
                <input className="w-6 h-6 text-primary border-outline-variant rounded focus:ring-primary cursor-pointer" type="radio" name="etatArrivee" checked={form.etatArrivee === etat} onChange={() => setForm({...form, etatArrivee: etat})} />
                <span className="text-sm font-extrabold text-on-surface-variant uppercase tracking-widest group-hover:text-primary">{etat}</span>
              </label>
            ))}
          </div></div>
        </section>

        {/* VALIDER */}
        <div className="flex justify-end pt-4 pb-8">
          <button onClick={handleSubmit} disabled={loading} className="bg-primary text-white px-8 py-4 rounded-xl font-headline font-extrabold shadow-lg hover:bg-primary-container hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            <span className="material-symbols-outlined">save</span> {loading ? 'ENREGISTREMENT...' : 'VALIDER ET ENREGISTRER'}
          </button>
        </div>
      </div>
    </main>
  )
}
