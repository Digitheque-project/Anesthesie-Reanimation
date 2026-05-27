'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'

export default function ApresOperationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'Jean-Luc Moreau'
  const intervention = searchParams.get('intervention') || ''

  const [form, setForm] = useState({
    dateCreation: new Date().toISOString().split('T')[0],
    interventionEnregistree: false, compteFinalCorrect: false, etiquetageVerifie: false,
    signalementsEffectues: false, transfertSalleReveil: false, observationsParticulieres: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await apiClient.post('/checklists-apres-op', { patientId, ...form })
      alert('✅ Checklist après opération enregistrée !')
      router.push(`/bloc/salle-de-reveil?patientId=${patientId}&patientNom=${encodeURIComponent(patientNom)}`)
    } catch (err) { console.error(err); alert('❌ Erreur') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline mb-4">
        <span className="material-symbols-outlined">arrow_back</span> Retour
      </button>

      {/* Patient Context Header */}
      <div className="mb-6 p-6 bg-surface-container-lowest rounded-2xl shadow-sm flex items-center justify-between border border-primary-fixed/30">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-surface-container rounded-full flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">patient_list</span>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold font-headline text-on-surface tracking-tight">Check-list après intervention – Check de sortie du bloc</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-on-surface-variant">
              <span className="font-medium">Patient: <strong className="text-on-surface">{patientNom}</strong></span>
              {intervention && <><span className="w-1 h-1 bg-outline-variant rounded-full"></span><span>{intervention}</span></>}
            </div>
          </div>
        </div>
      </div>

      {/* Check-list Form */}
      <div className="grid grid-cols-1 gap-6">
        <section className="bg-surface-container-low rounded-3xl p-8 border border-primary-container/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">1</div>
            <h3 className="text-lg font-bold font-headline text-on-surface">Confirmation orale par l'équipe</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              { key: 'interventionEnregistree', label: 'Intervention enregistrée' },
              { key: 'compteFinalCorrect', label: 'Compte final des compresses, aiguilles, instruments correct' },
              { key: 'etiquetageVerifie', label: 'Étiquetage des prélèvements/pièces opératoires vérifié' },
              { key: 'signalementsEffectues', label: 'Signalement des dysfonctionnements matériels et événements indésirables' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-outline-variant/10">
                <span className="font-medium text-on-surface">{item.label}</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input className="w-5 h-5 text-primary rounded" type="radio" name={item.key}
                      checked={form[item.key as keyof typeof form] as boolean} onChange={() => setForm({...form, [item.key]: true})} />
                    <span className="text-sm font-semibold">Oui</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input className="w-5 h-5 text-primary rounded" type="radio" name={item.key}
                      checked={!form[item.key as keyof typeof form] as boolean} onChange={() => setForm({...form, [item.key]: false})} />
                    <span className="text-sm font-semibold">Non/N/A</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Observations */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            <h3 className="text-sm font-bold font-headline text-on-surface uppercase tracking-wider">Observations Particulières</h3>
          </div>
          <textarea className="w-full min-h-[120px] rounded-2xl border-none bg-surface-container-low p-5 text-sm focus:ring-2 focus:ring-primary/10"
            placeholder="Saisissez ici les motifs de dérogation ou les incidents techniques notables..."
            value={form.observationsParticulieres} onChange={e => setForm({...form, observationsParticulieres: e.target.value})}></textarea>
        </section>
      </div>

      {/* Footer Action */}
      <div className="mt-10 flex justify-end pt-6 border-t border-outline-variant/10">
        <button onClick={handleSubmit} disabled={loading}
          className="px-8 py-4 bg-primary text-white font-headline font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl transition-all flex items-center gap-3">
          <span>{loading ? 'Enregistrement...' : 'Valider et enregistrer'}</span>
          <span className="material-symbols-outlined">save_as</span>
        </button>
      </div>
    </div>
  )
}
