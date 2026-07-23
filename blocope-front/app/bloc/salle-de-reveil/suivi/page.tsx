'use client'
import { Suspense } from "react";

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { patientService } from '@/lib/api'
import { apiClient } from '@/lib/api/client'
import { useRole } from '@/lib/hooks/useRole'
import { obtenirSessionValide } from '@/lib/auth/central-session'
import Checkbox from '@/components/ui/Checkbox'
import RoleGate from '@/components/bloc/auth/RoleGate'
import { RoleClinique } from '@/lib/auth/role-clinique'

const SERVICES_CLINIQUES = [
  'Médecine Interne', 'Chirurgie', 'Réanimation', 'Soins Intensifs',
  'Unité de Surveillance Continue', 'Médecine d\'Urgence', 'Cardiologie',
  'Pneumologie', 'Neurologie', 'Gastro-entérologie'
]

export default function SalleDeReveilPage() {
  return (
    <RoleGate allowedRoles={[RoleClinique.ANESTHESISTE]} message="Seul l'anesthésiste a accès à la salle de réveil.">
      <Suspense fallback={<div>Chargement...</div>}>
        <SalleDeReveilPageContent />
      </Suspense>
    </RoleGate>
  );
  }

function SalleDeReveilPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'Patient'
  const intervention = searchParams.get('intervention') || ''

  const { estAnesthesiste, roleName } = useRole()
  const [nomAnesthesiste, setNomAnesthesiste] = useState('')
  const [patient, setPatient] = useState<any>(null)
  const [heureArrivee, setHeureArrivee] = useState('14:25')
  const [scores, setScores] = useState({ motricite: 2, respiration: 2, pressionArterielle: 2, etatConscience: 2, coloration: 2 })
  const [evs, setEvs] = useState(2)
  const [eqa, setEqa] = useState(2)
  const [eva, setEva] = useState(3)
  const [etatInitial, setEtatInitial] = useState({ intubation: true, curarisation: false })
  const [reponse, setReponse] = useState({ intubation: false, curarisation: false })
  const [showOptionSortie, setShowOptionSortie] = useState(false)
  const [orientation, setOrientation] = useState<'origine' | 'autres'>('origine')
  const [serviceChoisi, setServiceChoisi] = useState('')
  const [scoreSCCREId, setScoreSCCREId] = useState<string | null>(null)
  const [checklistSortie, setChecklistSortie] = useState({ signesVitauxStables: false, douleurControlee: false, prescriptionsFaites: false, familleInformee: false })
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    if (patientId) patientService.getById(patientId).then(setPatient).catch(console.error)
  }, [patientId])

  useEffect(() => {
    const session = obtenirSessionValide()
    if (session) setNomAnesthesiste(`${session.payload.firstname} ${session.payload.name}`.trim())
  }, [])

  const scoreTotal = scores.motricite + scores.respiration + scores.pressionArterielle + scores.etatConscience + scores.coloration
  const checklistComplete = Object.values(checklistSortie).every(Boolean)

  const handleEnregistrerScore = async () => {
    if (!estAnesthesiste) { alert('❌ La surveillance de réveil est réservée à l\'anesthésiste.' + (roleName ? ` Votre rôle actuel est : ${roleName}.` : '')); return }
    try {
      const { data } = await apiClient.post('/scores-sccre', {
        patientId: patientId || patient?.id,
        heureArrivee, dateEvaluation: new Date().toISOString().split('T')[0],
        ...scores, evs, eqa, eva, etatInitial, reponse, sortieAutorisee: false
      })
      setScoreSCCREId(data.id)
    } catch (err: any) {
      console.error(err)
      const message = err.response?.data?.message || err.message || 'Erreur inconnue'
      alert('❌ Erreur lors de l\'enregistrement du score : ' + (Array.isArray(message) ? message.join(', ') : message))
    }
  }

  const handleValiderSortie = async () => {
    if (!estAnesthesiste) { alert('❌ L\'autorisation de sortie est réservée à l\'anesthésiste.' + (roleName ? ` Votre rôle actuel est : ${roleName}.` : '')); return }
    if (!scoreSCCREId) { alert('❌ Enregistrez d\'abord le score de réveil'); return }
    if (!checklistComplete) { alert('❌ Complétez la checklist de sortie avant de valider'); return }
    try {
      await apiClient.post('/sorties-reveil', {
        patientId, scoreSCCREId,
        dateHeureSortie: new Date().toISOString(),
        versServiceOrigine: orientation === 'origine',
        autresServicesDestination: orientation === 'autres' ? [serviceChoisi] : [],
        checklistSortie,
      })
      setShowConfirmation(true)
    } catch (err: any) {
      console.error(err)
      const message = err.response?.data?.message || err.message || 'Erreur inconnue'
      alert('❌ Erreur : ' + (Array.isArray(message) ? message.join(', ') : message))
    }
  }

  return (
    <main className="p-6">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center w-full px-8 py-4 border-b border-[#c7dde9]">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
          <span className="material-symbols-outlined">arrow_back</span> Retour
        </button>
        <h2 className="font-headline font-extrabold tracking-tight text-[#00478d] text-3xl">Salle de réveil</h2>
        <div className="w-20"></div>
      </header>

      <div className="bg-[#d5ecf8] px-8 py-3 flex items-center border-b border-[#c7dde9] justify-between">
        <div className="flex items-center space-x-6">
          <div><p className="text-[10px] text-[#424752] font-bold uppercase">Patient</p><p className="text-sm font-bold text-[#00478d]">{patientNom}</p></div>
          <div className="w-px h-6 bg-[#c7dde9]"></div>
          <div><p className="text-[10px] text-[#424752] font-bold uppercase">Intervention</p><p className="text-sm font-semibold">{intervention}</p></div>
          <div className="w-px h-6 bg-[#c7dde9]"></div>
          <div>
            <label className="text-[10px] text-[#424752] font-bold uppercase mb-0.5 block">Anesthésiste</label>
            <p className="text-xs font-bold text-[#00478d]">{estAnesthesiste ? (nomAnesthesiste || '—') : `Réservé à l'anesthésiste${roleName ? ` (rôle actuel : ${roleName})` : ''}`}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <label className="text-[10px] text-[#424752] font-bold uppercase mb-0.5">Heure d'arrivée</label>
          <div className="flex items-center bg-white/50 px-3 py-1.5 rounded-lg border border-white/40">
            <span className="material-symbols-outlined text-xs text-[#00478d] mr-1.5">schedule</span>
            <input className="bg-transparent border-none p-0 text-xs font-bold focus:ring-0 w-16" type="time" value={heureArrivee} onChange={e => setHeureArrivee(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="p-8 h-[calc(100vh-148px)] overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* État respiratoire */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold text-lg text-[#00478d] mb-4">État respiratoire / Neuromusculaire</h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#727783] mb-2">À l'arrivée en salle</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <label className="flex items-center p-3 rounded-lg bg-[#e6f6ff] cursor-pointer">
                  <Checkbox size="sm" checked={etatInitial.intubation} onChange={e => setEtatInitial({...etatInitial, intubation: e.target.checked})} />
                  <span className="ml-3 text-sm">Intubation (initial)</span>
                </label>
                <label className="flex items-center p-3 rounded-lg bg-[#e6f6ff] cursor-pointer">
                  <Checkbox size="sm" checked={etatInitial.curarisation} onChange={e => setEtatInitial({...etatInitial, curarisation: e.target.checked})} />
                  <span className="ml-3 text-sm">Curarisation (initial)</span>
                </label>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#727783] mb-2">Réponse observée</p>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-3 rounded-lg bg-[#e6f6ff] cursor-pointer">
                  <Checkbox size="sm" checked={reponse.intubation} onChange={e => setReponse({...reponse, intubation: e.target.checked})} />
                  <span className="ml-3 text-sm">Extubation obtenue</span>
                </label>
                <label className="flex items-center p-3 rounded-lg bg-[#e6f6ff] cursor-pointer">
                  <Checkbox size="sm" checked={reponse.curarisation} onChange={e => setReponse({...reponse, curarisation: e.target.checked})} />
                  <span className="ml-3 text-sm">Décurarisation obtenue</span>
                </label>
              </div>
            </div>

            {/* Douleur */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold text-lg text-[#00478d] mb-4">Évaluation de la Douleur</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase">EVS</label>
                  <div className="flex space-x-2 mt-1">
                    {[1,2,3].map(v => (
                      <button key={v} onClick={() => setEvs(v)} className={`flex-1 py-2 rounded-lg border text-xs font-bold ${evs === v ? 'border-2 border-[#00478d] bg-[#00478d]/10' : 'border-[#c7dde9]/30 bg-[#e6f6ff]'}`}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase">EQA</label>
                  <div className="flex space-x-2 mt-1">
                    {[1,2,3].map(v => (
                      <button key={v} onClick={() => setEqa(v)} className={`flex-1 py-2 rounded-lg border text-xs font-bold ${eqa === v ? 'border-2 border-[#00478d] bg-[#00478d]/10' : 'border-[#c7dde9]/30 bg-[#e6f6ff]'}`}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase">EVA (0-10) : {eva}</label>
                  <input type="range" min="0" max="10" value={eva} onChange={e => setEva(Number(e.target.value))} className="w-full accent-[#00478d]" />
                </div>
              </div>
            </div>
          </div>

          {/* Score SCCRE */}
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg text-[#00478d]">Score de réveil (SCCRE)</h3>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase mb-1">Score Total</span>
                <div className="text-3xl font-black text-[#006a6a]">{scoreTotal}<span className="text-sm font-medium text-[#727783]">/10</span></div>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Motricité', key: 'motricite' },
                { label: 'Respiration', key: 'respiration' },
                { label: 'Pression artérielle', key: 'pressionArterielle' },
                { label: 'État de conscience', key: 'etatConscience' },
                { label: 'Coloration', key: 'coloration' },
              ].map(item => (
                <div key={item.key} className="grid grid-cols-12 items-center py-3 border-b border-[#cfe6f2]">
                  <div className="col-span-4"><p className="text-sm font-bold">{item.label}</p></div>
                  <div className="col-span-8 flex space-x-2">
                    {[0,1,2].map(val => (
                      <button key={val} onClick={() => setScores({...scores, [item.key]: val})}
                        className={`flex-1 py-3 rounded-lg text-[10px] font-bold transition-all ${scores[item.key as keyof typeof scores] === val ? 'bg-[#00478d] text-white shadow-md' : 'bg-[#e6f6ff] text-[#424752] hover:bg-[#d5ecf8]'}`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleEnregistrerScore} disabled={!estAnesthesiste}
              title={!estAnesthesiste ? 'Réservé à l\'anesthésiste' : undefined}
              className="mt-6 w-full py-3 bg-[#00478d] text-white font-bold rounded-xl shadow-lg hover:bg-[#005eb8] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {!estAnesthesiste ? 'Réservé à l\'anesthésiste' : scoreSCCREId ? '✓ Score enregistré — Réenregistrer' : 'Valider le score'}
            </button>
          </div>

          {/* Checklist de sortie */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold text-lg text-[#00478d] mb-4">Checklist de sortie</h3>
            <div className="space-y-3">
              {[
                { key: 'signesVitauxStables', label: 'Signes vitaux stables' },
                { key: 'douleurControlee', label: 'Douleur contrôlée' },
                { key: 'prescriptionsFaites', label: 'Prescriptions post-opératoires faites' },
                { key: 'familleInformee', label: 'Famille / service informé' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 p-3 bg-[#e6f6ff] rounded-lg cursor-pointer">
                  <Checkbox
                    checked={checklistSortie[item.key as keyof typeof checklistSortie]}
                    onChange={e => setChecklistSortie({ ...checklistSortie, [item.key]: e.target.checked })} />
                  <span className="text-sm font-medium">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Décision de sortie + Option de sortie */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold text-lg text-[#00478d] mb-4">Décision de sortie</h3>
            <button onClick={() => setShowOptionSortie(true)}
              className="px-6 py-2.5 bg-sky-400 text-white font-bold rounded-xl shadow-md hover:bg-sky-500 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined">settings</span> Option de sortie
            </button>
            {orientation === 'autres' && serviceChoisi && <p className="mt-2 text-sm font-bold text-[#00478d]">Service : {serviceChoisi}</p>}
            {orientation === 'origine' && <p className="mt-2 text-sm font-bold text-[#006a6a]">Service d'origine</p>}

            <button onClick={handleValiderSortie} disabled={scoreTotal < 9 || !scoreSCCREId || !checklistComplete || !estAnesthesiste}
              className={`mt-4 w-full py-3 font-bold rounded-xl transition-all ${
                scoreTotal >= 9 && scoreSCCREId && checklistComplete && estAnesthesiste ? 'bg-gradient-to-br from-[#00478d] to-[#005eb8] text-white shadow-xl hover:shadow-[#00478d]/40' : 'bg-gray-400 text-white cursor-not-allowed'
              }`}>
              {scoreTotal < 9 ? 'Score insuffisant (< 9)' : !scoreSCCREId ? 'Enregistrez le score ci-dessus' : !checklistComplete ? 'Complétez la checklist' : !estAnesthesiste ? `Réservé à l'anesthésiste${roleName ? ` (rôle actuel : ${roleName})` : ''}` : 'Autoriser la sortie'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Orientation */}
      {showOptionSortie && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-extrabold text-[#00478d] mb-6">Orientation du patient</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-4 rounded-xl border cursor-pointer hover:bg-[#f3faff]">
                <input type="radio" name="orientation" checked={orientation === 'origine'} onChange={() => setOrientation('origine')} className="w-5 h-5 text-[#00478d]" />
                <span className="font-bold">Service d'origine</span>
              </label>
              <label className="flex items-center space-x-3 p-4 rounded-xl border cursor-pointer hover:bg-[#f3faff]">
                <input type="radio" name="orientation" checked={orientation === 'autres'} onChange={() => setOrientation('autres')} className="w-5 h-5 text-[#00478d]" />
                <span className="font-bold">Autres services</span>
              </label>
              {orientation === 'autres' && (
                <select value={serviceChoisi} onChange={e => setServiceChoisi(e.target.value)} className="w-full mt-2 border rounded-xl p-3 text-sm">
                  <option value="">Sélectionner un service...</option>
                  {SERVICES_CLINIQUES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowOptionSortie(false)} className="px-6 py-2 border rounded-lg text-sm font-bold hover:bg-gray-100">Annuler</button>
              <button onClick={() => setShowOptionSortie(false)} className="px-6 py-2 bg-[#00478d] text-white rounded-lg text-sm font-bold">Valider</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation finale */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
            </div>
            <h3 className="text-xl font-extrabold text-on-surface mb-2">Validation terminée !</h3>
            <p className="text-sm text-on-surface-variant mb-6">Toutes les informations ont été enregistrées avec succès.</p>
            <div className="flex gap-3">
              <button onClick={() => router.push('/bloc/archives')}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all">
                📁 Voir les archives
              </button>
              <button onClick={() => router.push('/bloc')}
                className="flex-1 py-3 border border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all">
                🏠 Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
  }
