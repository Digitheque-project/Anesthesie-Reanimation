'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'

export default function VerificationPostOpPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'Patient'
  const intervention = searchParams.get('intervention') || ''
  const [form, setForm] = useState({ dateCreation: new Date().toISOString().split('T')[0], identiteUltimeConfirmee: false, interventionConfirmee: false, siteOperatoireConfirme: false, installationCorrecte: false, documentsDisponibles: false, antibioprophylaxieFaite: false, constantesStables: false, ventilationOK: false })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try { await apiClient.post('/checklists-pendant-op', { patientId, ...form }); alert('✅ Checklist enregistrée !'); router.back() }
    catch (err) { console.error(err); alert('❌ Erreur') }
    finally { setLoading(false) }
  }

  return (
    <main className="ml-64 p-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline mb-4"><span className="material-symbols-outlined">arrow_back</span> Retour</button>
      <h1 className="text-2xl font-extrabold mb-2">🔍 Checklist de vérification</h1>
      <div className="bg-blue-50 rounded-xl p-4 mb-4 flex gap-6 text-sm"><div><span className="text-xs font-bold text-gray-500 uppercase">Patient</span><p className="font-bold">{patientNom}</p></div>{intervention && <div><span className="text-xs font-bold text-gray-500 uppercase">Intervention</span><p className="font-bold">{intervention}</p></div>}</div>
      <div className="bg-white rounded-xl p-6 shadow-sm border space-y-3 max-w-2xl">
        {[{ key: 'identiteUltimeConfirmee', label: 'Identité ultime confirmée' },{ key: 'interventionConfirmee', label: 'Intervention confirmée' },{ key: 'siteOperatoireConfirme', label: 'Site opératoire confirmé' },{ key: 'installationCorrecte', label: 'Installation correcte' },{ key: 'documentsDisponibles', label: 'Documents disponibles' },{ key: 'antibioprophylaxieFaite', label: 'Antibioprophylaxie faite' },{ key: 'constantesStables', label: 'Constantes stables' },{ key: 'ventilationOK', label: 'Ventilation OK' }].map(item => (
          <label key={item.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer"><input type="checkbox" checked={form[item.key as keyof typeof form] as boolean} onChange={e => setForm({...form, [item.key]: e.target.checked})} className="w-5 h-5 text-primary rounded" /><span className="font-medium text-sm">{item.label}</span></label>
        ))}
        <button onClick={handleSubmit} disabled={loading} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90">{loading ? 'Enregistrement...' : 'Valider'}</button>
      </div>
    </main>
  )
}
