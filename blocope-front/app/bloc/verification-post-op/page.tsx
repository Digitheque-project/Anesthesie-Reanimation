'use client'
import { Suspense } from "react";
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { useOperationRealtime } from '@/lib/hooks/useOperationRealtime'
import RealtimeUpdateBanner from '@/components/bloc/layout/RealtimeUpdateBanner'

export default function VerificationPostOpPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VerificationPostOpPageContent />
    </Suspense>
  );
  }

const ITEMS: { key: string; numero: number; titre: string; desc?: string }[] = [
  { key: 'identiteUltimeConfirmee', numero: 1, titre: 'Identité du patient', desc: 'Confirmée une dernière fois par toute l\'équipe' },
  { key: 'interventionConfirmee', numero: 2, titre: 'Intervention prévue confirmée', desc: 'Nature et déroulé de l\'intervention validés par l\'équipe' },
  { key: 'siteOperatoireConfirme', numero: 3, titre: 'Site opératoire confirmé', desc: 'Marquage et côté vérifiés' },
  { key: 'installationCorrecte', numero: 4, titre: 'Installation correcte', desc: 'Position du patient validée pour l\'intervention' },
  { key: 'documentsDisponibles', numero: 5, titre: 'Documents disponibles', desc: 'Dossier, imagerie et examens nécessaires en salle' },
  { key: 'antibioprophylaxieFaite', numero: 6, titre: 'Antibioprophylaxie effectuée', desc: 'Dans le délai requis avant incision' },
  { key: 'constantesStables', numero: 7, titre: 'Constantes stables', desc: 'Paramètres vitaux compatibles avec le début de l\'intervention' },
  { key: 'ventilationOK', numero: 8, titre: 'Ventilation OK', desc: 'Paramètres ventilatoires vérifiés' },
]

function VerificationPostOpPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'Patient'
  const intervention = searchParams.get('intervention') || ''
  const [form, setForm] = useState({ dateCreation: new Date().toISOString().split('T')[0], identiteUltimeConfirmee: false, interventionConfirmee: false, siteOperatoireConfirme: false, installationCorrecte: false, documentsDisponibles: false, antibioprophylaxieFaite: false, constantesStables: false, ventilationOK: false })
  const [loading, setLoading] = useState(false)
  const [majDistante, setMajDistante] = useState(false)
  const { on } = useOperationRealtime(patientId)

  useEffect(() => on('checklist-pendant-op:maj', () => setMajDistante(true)), [on])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await apiClient.post('/checklists-pendant-op', { patientId, ...form })
      alert('✅ Checklist avant incision enregistrée !')
      router.push(`/bloc/activite-pendant-operation?patientId=${patientId}&patientNom=${encodeURIComponent(patientNom)}&intervention=${encodeURIComponent(intervention)}`)
    }
    catch (err: any) {
      console.error(err)
      const message = err.response?.data?.message || err.message || 'Erreur inconnue'
      alert('❌ Erreur : ' + (Array.isArray(message) ? message.join(', ') : message))
    }
    finally { setLoading(false) }
  }

  return (
    <main className="p-6">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center gap-4">
        <button onClick={() => router.back()} className="flex items-center space-x-2 px-6 py-2.5 border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-all font-semibold shrink-0 order-first">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="text-sm">Retour</span>
        </button>
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">Check-list avant incision</h1>
          <p className="text-on-surface-variant mt-2 text-lg">{patientNom} — {intervention}</p>
        </div>
      </header>

      <RealtimeUpdateBanner visible={majDistante} onRecharger={() => window.location.reload()} />

      {/* Bento Grid — même style que le checklist avant induction */}
      <section className="bg-surface-container-low rounded-xl p-6 shadow-sm border-t-4 border-secondary max-w-3xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary">pause_circle</span>
          </div>
          <h2 className="text-xl font-headline font-bold text-secondary uppercase tracking-wide">Dernière pause d'équipe</h2>
        </div>
        <p className="text-xs italic text-on-surface-variant mb-6">Chirurgien + anesthésiste + IBODE, juste avant l'incision</p>

        <div className="space-y-4">
          {ITEMS.map(item => (
            <div key={item.key} className="bg-white p-4 rounded-lg border border-outline-variant/10">
              <p className="text-sm font-bold text-secondary mb-1">{item.numero}- {item.titre} :</p>
              {item.desc && <p className="text-xs mb-3">{item.desc}</p>}
              <div className="flex space-x-6">
                <label className="flex items-center text-xs font-medium cursor-pointer">
                  <input className="mr-2 text-secondary focus:ring-secondary w-4 h-4" name={item.key} type="radio" checked={form[item.key as keyof typeof form] as boolean} onChange={() => setForm({ ...form, [item.key]: true })} /><span>Oui</span>
                </label>
                <label className="flex items-center text-xs font-medium cursor-pointer">
                  <input className="mr-2 text-secondary focus:ring-secondary w-4 h-4" name={item.key} type="radio" checked={!(form[item.key as keyof typeof form] as boolean)} onChange={() => setForm({ ...form, [item.key]: false })} /><span>Non</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Actions */}
      <div className="mt-12 flex justify-end items-center max-w-3xl">
        <button onClick={handleSubmit} disabled={loading}
          className="flex items-center space-x-2 px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <span>{loading ? 'Validation...' : 'Valider la check-list'}</span>
        </button>
      </div>
    </main>
  )
  }
