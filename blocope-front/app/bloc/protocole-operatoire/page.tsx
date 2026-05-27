'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'

export default function ProtocoleOperatoirePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'Marc LAHINIRINA'

  const [form, setForm] = useState({
    dateOperation: new Date().toISOString().split('T')[0],
    compteRenduIntervention: '',
    surveillanceTA: '', surveillancePouls: '', surveillanceFR: '', surveillanceTemp: '', surveillanceDiurese: '', surveillanceAutres: '',
    perfusionBrasGauche: false, perfusionBrasDroit: false, voieCentrale: false,
    antibiotiques: '', antalgiques: '', autres: '',
    prescriptionsConjointes: false,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await apiClient.post('/protocoles-operatoires', {
        patientId, dateOperation: form.dateOperation,
        chirurgienId: '', anesthesisteId: '', infirmiereId: '', aideOperatoireId: '',
        compteRenduIntervention: form.compteRenduIntervention,
        surveillance: { ta: form.surveillanceTA, pouls: form.surveillancePouls, fr: form.surveillanceFR, temperature: form.surveillanceTemp, diurese: form.surveillanceDiurese, autres: form.surveillanceAutres },
        prescriptions: { perfusionBrasGauche: form.perfusionBrasGauche, perfusionBrasDroit: form.perfusionBrasDroit, voieCentrale: form.voieCentrale, antibiotiques: form.antibiotiques, antalgiques: form.antalgiques, autres: form.autres },
        prescriptionsConjointes: form.prescriptionsConjointes,
        drainages: []
      })
      alert('✅ Protocole enregistré ! Redirection vers la salle de réveil.')
      router.push(`/bloc/salle-de-reveil?patientId=${patientId}&patientNom=${encodeURIComponent(patientNom)}`)
    } catch (err) { console.error(err); alert('❌ Erreur') }
    finally { setLoading(false) }
  }

  return (
    <main className="p-6 flex gap-6 h-full overflow-y-auto">
      {/* Colonne gauche : Protocole */}
      <section className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">Protocole Opératoire</h2>
          <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold uppercase">Édition Libre</span>
        </div>
        <div className="flex-1 bg-surface-container-lowest rounded-xl shadow-sm flex flex-col p-6 ring-1 ring-black/5">
          <label className="text-sm font-bold text-on-surface-variant mb-3 block">Compte-rendu de l'intervention</label>
          <textarea className="flex-1 w-full bg-surface-container-low rounded-lg p-4 text-on-surface border-none resize-none leading-relaxed"
            placeholder="Saisissez ici les détails de l'intervention, les observations per-opératoires et les éventuelles complications..."
            value={form.compteRenduIntervention} onChange={e => setForm({...form, compteRenduIntervention: e.target.value})}></textarea>
        </div>
      </section>

      {/* Colonne droite : Instructions */}
      <section className="w-[500px] flex flex-col space-y-6">
        <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">Instructions Post-opératoires</h2>
        <div className="space-y-4">
          {/* Surveillance */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm ring-1 ring-black/5">
            <div className="flex items-center space-x-2 mb-4"><span className="material-symbols-outlined text-primary text-xl">monitor_heart</span><h3 className="font-headline font-bold uppercase text-xs tracking-widest">1. Surveillance</h3></div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              {[
                { label: 'TA (Tension)', key: 'surveillanceTA', placeholder: 'Val...' },
                { label: 'Pouls', key: 'surveillancePouls', placeholder: 'bpm' },
                { label: 'FR (Respiration)', key: 'surveillanceFR', placeholder: 'c/min' },
                { label: 'Température', key: 'surveillanceTemp', placeholder: '°C' },
                { label: 'Diurèse', key: 'surveillanceDiurese', placeholder: 'ml' },
                { label: 'Autres', key: 'surveillanceAutres', placeholder: '...' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between col-span-2 py-1 border-b border-slate-50">
                  <span className="text-sm font-medium text-on-surface-variant">{item.label}</span>
                  <input className="w-24 bg-slate-50 border-none rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary/30" placeholder={item.placeholder} type="text"
                    value={form[item.key as keyof typeof form] as string} onChange={e => setForm({...form, [item.key]: e.target.value})} />
                </div>
              ))}
            </div>
          </div>

          {/* Prescriptions */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm ring-1 ring-black/5">
            <div className="flex items-center space-x-2 mb-4"><span className="material-symbols-outlined text-primary text-xl">prescriptions</span><h3 className="font-headline font-bold uppercase text-xs tracking-widest">3. Prescription à suivre</h3></div>
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-black text-outline uppercase tracking-wider mb-2">Perfusion</h4>
                {[
                  { label: 'Bras gauche', key: 'perfusionBrasGauche' },
                  { label: 'Bras droit', key: 'perfusionBrasDroit' },
                  { label: 'Voie centrale', key: 'voieCentrale' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between bg-surface-container-low p-2 rounded-lg mb-1">
                    <span className="text-xs font-medium">{item.label}</span>
                    <label className="flex items-center space-x-2">
                      <input className="w-4 h-4 rounded border-surface-dim text-secondary focus:ring-secondary/20" type="checkbox"
                        checked={form[item.key as keyof typeof form] as boolean} onChange={e => setForm({...form, [item.key]: e.target.checked})} />
                      <span className="text-[10px] font-bold text-secondary uppercase">En Y</span>
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-[10px] font-black text-outline uppercase tracking-wider mb-2">Traitement</h4>
                {[
                  { placeholder: 'Antibiotiques...', key: 'antibiotiques', icon: 'vaccines', color: 'border-l-secondary' },
                  { placeholder: 'Antalgiques...', key: 'antalgiques', icon: 'pill', color: 'border-l-primary' },
                  { placeholder: 'Autres...', key: 'autres', icon: 'more_horiz', color: 'border-l-outline' },
                ].map(item => (
                  <div key={item.key} className={`flex items-center bg-surface-container-low p-3 rounded-lg ${item.color} border-l-4 mb-2`}>
                    <span className="material-symbols-outlined text-outline mr-2 text-sm">{item.icon}</span>
                    <input className="bg-transparent border-none text-xs w-full focus:ring-0 placeholder:text-slate-400" placeholder={item.placeholder} type="text"
                      value={form[item.key as keyof typeof form] as string} onChange={e => setForm({...form, [item.key]: e.target.value})} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Valider */}
        <div className="flex justify-end pt-4 pb-8">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-3 shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95">
            <span className="material-symbols-outlined">save</span>
            <span>{loading ? 'Enregistrement...' : 'Valider et enregistrer'}</span>
          </button>
        </div>
      </section>
    </main>
  )
}
