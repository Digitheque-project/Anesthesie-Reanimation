'use client'
import { Suspense } from "react";

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { patientService } from '@/lib/api'
import RoleGate from '@/components/bloc/auth/RoleGate'
import { RoleClinique } from '@/lib/auth/role-clinique'
import PatientIdentityHeader from '@/components/bloc/patient/PatientIdentityHeader'

export default function ArriveeBlocPage() {
  return (
    <RoleGate allowedRoles={[RoleClinique.ANESTHESISTE]} message="Seul l'anesthésiste enregistre l'arrivée du patient au bloc.">
      <Suspense fallback={<div>Chargement...</div>}>
        <ArriveeBlocPageContent />
      </Suspense>
    </RoleGate>
  );
}

const ETATS = ['CALME', 'DETENDU', 'ANXIEUX', 'AGITE'] as const

const ETAT_CONFIG: Record<typeof ETATS[number], { icone: string; bg: string; border: string; icon: string; texte: string }> = {
  CALME: { icone: 'sentiment_very_satisfied', bg: 'bg-emerald-50', border: 'border-emerald-400', icon: 'text-emerald-600', texte: 'text-emerald-800' },
  DETENDU: { icone: 'sentiment_satisfied', bg: 'bg-blue-50', border: 'border-blue-400', icon: 'text-blue-600', texte: 'text-blue-800' },
  ANXIEUX: { icone: 'sentiment_dissatisfied', bg: 'bg-amber-50', border: 'border-amber-400', icon: 'text-amber-600', texte: 'text-amber-800' },
  AGITE: { icone: 'sentiment_very_dissatisfied', bg: 'bg-red-50', border: 'border-red-400', icon: 'text-red-600', texte: 'text-red-800' },
}

function ArriveeBlocPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'Patient'
  const intervention = searchParams.get('intervention') || ''
  const [patient, setPatient] = useState<any>(null)
  const [activiteId, setActiviteId] = useState<string | null>(null)
  const [etatArrivee, setEtatArrivee] = useState('')
  const [momentsConfirmes, setMomentsConfirmes] = useState<Set<string>>(new Set())
  const [enCours, setEnCours] = useState<string | null>(null)

  useEffect(() => {
    if (!patientId) return
    patientService.getById(patientId).then(setPatient).catch(console.error)
  }, [patientId])

  // Même logique que l'ancienne Section 0 de l'activité per-opératoire : on crée l'enregistrement
  // ActivitePerOp dès cette étape (avant même la checklist), pour que l'état à l'arrivée et les
  // moments "Arrivée en salle"/"Installation du patient" s'y rattachent depuis le tout début.
  useEffect(() => {
    if (!patientId) return
    let annule = false
    apiClient.get('/activites-per-op', { params: { patientId, limite: 1 } })
      .then(async ({ data }) => {
        if (annule) return
        const existante = data?.data?.[0]
        if (existante) {
          setActiviteId(existante.id)
          if (existante.etatArrivee?.[0]) setEtatArrivee(existante.etatArrivee[0])
          return
        }
        const { data: creee } = await apiClient.post('/activites-per-op', {
          patientId,
          dateOperation: new Date().toISOString().split('T')[0],
          intubationOT: false,
          sArme: false,
          masqueLarynge: false,
        })
        if (!annule) setActiviteId(creee.id)
      })
      .catch(console.error)
    return () => { annule = true }
  }, [patientId])

  const choisirEtatArrivee = async (etat: string) => {
    setEtatArrivee(etat)
    if (!activiteId) return
    try {
      await apiClient.patch(`/activites-per-op/${activiteId}`, { etatArrivee: [etat] })
    } catch (err) {
      console.error(err)
    }
  }

  const declencherMoment = async (label: string) => {
    setEnCours(label)
    try {
      await apiClient.post('/moments-operatoires', {
        patientId, label, categorie: 'ANESTHESIE', estPersonnalise: false, horodatage: new Date().toISOString(),
      })
      setMomentsConfirmes(prev => new Set(prev).add(label))
    } catch (err) {
      console.error(err)
      alert("❌ Erreur lors de l'enregistrement du moment")
    } finally {
      setEnCours(null)
    }
  }

  const continuer = () => {
    router.push(`/bloc/checklist-oms?patientId=${patientId}&patientNom=${encodeURIComponent(patientNom)}&intervention=${encodeURIComponent(intervention)}`)
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <PatientIdentityHeader patient={patient || { nom: patientNom }} intervention={intervention} />

      <div className="mt-4 space-y-6">
        {/* Arrivée / Installation */}
        <section className="bg-white rounded-2xl shadow-md border border-surface-container-highest overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-container px-6 py-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-white text-2xl">door_front</span>
            <div>
              <h3 className="font-headline font-extrabold text-white uppercase tracking-wide text-sm">Arrivée au bloc</h3>
              <p className="text-white/80 text-[11px] font-medium">À réaliser avant la check-list avant opération</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Arrivée en salle', 'Installation du patient'].map(label => {
              const confirme = momentsConfirmes.has(label)
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => !confirme && declencherMoment(label)}
                  disabled={enCours === label || confirme}
                  className={`flex items-center justify-center gap-3 p-6 rounded-xl border-2 font-bold text-sm uppercase tracking-wide transition-all ${
                    confirme ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-surface-container-low border-outline-variant hover:border-primary hover:bg-primary-fixed/20'
                  } disabled:cursor-default`}
                >
                  <span className="material-symbols-outlined text-2xl">{confirme ? 'check_circle' : 'radio_button_unchecked'}</span>
                  {label}
                  {enCours === label && '…'}
                </button>
              )
            })}
          </div>
        </section>

        {/* État du patient à l'arrivée */}
        <section className="bg-white rounded-2xl shadow-md border border-surface-container-highest overflow-hidden">
          <div className="bg-gradient-to-r from-secondary to-secondary/80 px-6 py-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-white text-2xl">mood</span>
            <div>
              <h3 className="font-headline font-extrabold text-white uppercase tracking-wide text-sm">État du patient à l'arrivée</h3>
              <p className="text-white/80 text-[11px] font-medium">Premier constat clinique en entrant en salle d'opération</p>
            </div>
          </div>
          <div className="p-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ETATS.map(etat => {
              const cfg = ETAT_CONFIG[etat]
              const actif = etatArrivee === etat
              return (
                <label key={etat} className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 cursor-pointer transition-all group ${
                  actif ? `${cfg.bg} ${cfg.border} shadow-md scale-[1.03]` : 'bg-background border-surface-container-highest hover:border-outline-variant hover:shadow-sm'
                }`}>
                  <input className="sr-only" type="radio" name="etatArrivee" checked={actif} onChange={() => choisirEtatArrivee(etat)} />
                  <span className={`material-symbols-outlined text-3xl ${actif ? cfg.icon : 'text-on-surface-variant/50'}`} style={actif ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {cfg.icone}
                  </span>
                  <span className={`text-sm font-extrabold uppercase tracking-widest ${actif ? cfg.texte : 'text-on-surface-variant'}`}>{etat}</span>
                </label>
              )
            })}
          </div></div>
        </section>

        <div className="flex justify-end pb-8">
          <button
            onClick={continuer}
            className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-xl font-headline font-extrabold shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            Continuer vers la check-list
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </main>
  )
}
