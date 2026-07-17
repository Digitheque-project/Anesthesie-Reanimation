'use client'
import { Suspense } from "react";

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { patientService } from '@/lib/api'
import { useRole } from '@/lib/hooks/useRole'

export default function VerificationVeillePage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VerificationVeillePageContent />
    </Suspense>
  );
}

function VerificationVeillePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'Patient'
  const [patient, setPatient] = useState<any>(null)
  const [cpa, setCpa] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { estAnesthesiste, roleName } = useRole()
  const [form, setForm] = useState({
    dateVisite: new Date().toISOString().split('T')[0],
    identiteConfirmee: true, jeuneRespected: true, instructionsRespectees: true, premedicationFaite: true,
    jeune: '', examensComplementaires: '', heureDepart: '09:00',
  })

  useEffect(() => {
    if (patientId) {
      patientService.getById(patientId).then(setPatient).catch(console.error)
      apiClient.get(`/cpa?patientId=${patientId}`).then(res => {
        if (res.data?.data?.length > 0) setCpa(res.data.data[0])
      }).catch(() => {})
    }
  }, [patientId])

  const cpaId = cpa?.id || ''

  const handleSubmit = async () => {
    if (!estAnesthesiste) {
      alert('❌ La vérification veille est réservée à l\'anesthésiste' + (roleName ? ` (votre rôle : ${roleName})` : ''))
      return
    }
    if (!cpaId) {
      alert('⚠️ Aucune CPA trouvée pour ce patient. Veuillez d\'abord réaliser une CPA.')
      return
    }
    setLoading(true)
    try {
      await apiClient.post('/verification-veille', {
        patientId: patientId || patient?.id,
        cpaId,
        ...form
      })
      alert('✅ Vérification veille validée avec succès !')
      router.push('/bloc/rendez-vous')
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || err.message || 'Erreur inconnue'
      alert('❌ Erreur : ' + (Array.isArray(message) ? message.join(', ') : message))
    }
    finally { setLoading(false) }
  }

  return (
    <main className="p-6">
      {/* Patient Context Header */}
      <div className="p-6 bg-white rounded-xl flex flex-wrap items-center justify-between gap-6 shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <span className="material-symbols-outlined text-4xl text-primary flex items-center justify-center w-full h-full bg-primary-fixed">account_circle</span>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-primary tracking-tight">{patientNom}</h2>
            <div className="flex gap-4 text-sm text-on-surface-variant font-medium">
              <span>{patient?.dateNaissance ? `Née le ${new Date(patient.dateNaissance).toLocaleDateString('fr-FR')} (${new Date().getFullYear() - new Date(patient.dateNaissance).getFullYear()} ans)` : '—'}</span>
              <span className="text-outline-variant">•</span>
              <span>IPP: {patient?.idDossier || '—'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {cpaId ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase tracking-wider">✅ CPA validée</span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase tracking-wider">⚠️ CPA non réalisée</span>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm text-on-surface-variant">Contrôle final réalisé la veille de l'intervention, avant le passage au bloc.</p>
      {!estAnesthesiste && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          La validation de la vérification veille est réservée à l'anesthésiste{roleName ? ` (votre rôle : ${roleName})` : ''}. Vous pouvez consulter les informations, mais pas valider.
        </div>
      )}

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Vérification de sécurité */}
        <section className="lg:col-span-8 bg-white rounded-xl p-8 shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
            <h3 className="text-xl font-bold text-on-surface">Vérification de sécurité</h3>
          </div>
          <div className="space-y-6">
            {[
              { icon: 'badge', titre: 'Identité du patient confirmée', desc: 'Vérification du bracelet et de l\'interrogatoire', key: 'identiteConfirmee' },
              { icon: 'fastfood', titre: 'Jeûne pré-opératoire respecté', desc: 'Dernière ingestion solide > 6h / Liquide > 2h', key: 'jeuneRespected' },
              { icon: 'assignment_turned_in', titre: 'Instructions pré-anesthésiques respectées', desc: 'Arrêt des traitements (Anticoagulants, etc.)', key: 'instructionsRespectees' },
            ].map(item => (
              <div key={item.key} className="p-6 bg-surface-container-low rounded-lg flex items-center justify-between group hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{item.titre}</p>
                    <p className="text-[11px] text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
                <div className="flex bg-white/80 p-1 rounded border border-outline-variant/30">
                  <button onClick={() => setForm({...form, [item.key]: true})}
                    className={`px-5 py-1.5 rounded font-bold text-xs transition-all ${form[item.key as keyof typeof form] ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:bg-white'}`}>OUI</button>
                  <button onClick={() => setForm({...form, [item.key]: false})}
                    className={`px-5 py-1.5 rounded font-bold text-xs transition-all ${!form[item.key as keyof typeof form] ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:bg-white'}`}>NON</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Décision CPA (rappel) */}
        <section className="lg:col-span-4 bg-surface-container-high rounded-xl p-8 flex flex-col shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">history_edu</span>
            <h3 className="text-lg font-bold text-on-surface">CPA de référence</h3>
          </div>
          {cpa ? (
            <div className="flex-1 space-y-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-secondary shadow-sm">
                <p className="text-[9px] uppercase font-bold text-secondary tracking-widest mb-1">Score ASA</p>
                <p className="text-2xl font-black text-on-surface">{cpa.scoreASA ?? '—'}</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <p className="text-[9px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">Protocole retenu</p>
                <p className="text-sm font-semibold text-on-surface leading-relaxed">{cpa.typeAnesthesie || '—'}{cpa.techniqueIntubation ? ` — ${cpa.techniqueIntubation}` : ''}</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <p className="text-[9px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">Décision</p>
                <p className="text-sm font-semibold text-on-surface">{cpa.decision || '—'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant italic">Aucune CPA trouvée pour ce patient.</p>
          )}
        </section>

        {/* Prémédication & Préparation */}
        <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">medication_liquid</span>
              <h3 className="text-lg font-bold text-on-surface">Prémédication</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={!form.premedicationFaite} onChange={e => setForm({...form, premedicationFaite: !e.target.checked})} className="w-4 h-4 text-primary rounded" />
                <span className="text-sm font-semibold">Non-faite</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.premedicationFaite} onChange={e => setForm({...form, premedicationFaite: e.target.checked})} className="w-4 h-4 text-primary rounded" />
                <span className="text-sm font-semibold">Faite</span>
              </label>
            </div>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">clinical_notes</span>
              <h3 className="text-lg font-bold text-on-surface">Préparation</h3>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-semibold">Jeûne complet à partir de...</label>
              <input className="w-full bg-surface-container-low border border-outline-variant/30 rounded text-sm px-3 py-2" placeholder="Heure ou instructions..." type="text" value={form.jeune} onChange={e => setForm({...form, jeune: e.target.value})} />
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <section className="lg:col-span-12 flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-surface-container text-on-surface rounded-xl shadow-sm border border-outline-variant/30">
          <div className="flex flex-col items-center md:items-start">
            <label className="text-[9px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">HEURE DE DÉPART AU BLOC</label>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-primary">schedule</span>
              <input
                type="time"
                value={form.heureDepart}
                onChange={e => setForm({...form, heureDepart: e.target.value})}
                className="bg-transparent border border-primary/30 rounded-lg px-4 py-2 text-2xl font-black text-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
                style={{ width: '140px' }}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button
              onClick={() => router.push('/bloc/checklist-oms')}
              className="px-6 py-4 border-2 border-primary/30 text-primary rounded-lg font-bold text-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[20px]">fact_check</span> ACCÉDER À LA CHECKLIST-OMS
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !cpaId}
              className={`px-10 py-4 rounded-lg font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap ${
                cpaId ? 'bg-primary text-on-primary hover:bg-primary/90' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined font-bold">check_circle</span>
              {!cpaId ? 'CPA REQUISE' : loading ? 'VALIDATION...' : 'VALIDER LA VÉRIFICATION'}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
