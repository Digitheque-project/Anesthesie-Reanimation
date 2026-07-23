'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { medecinService } from '@/lib/api'
import { useRole } from '@/lib/hooks/useRole'
import Checkbox from '@/components/ui/Checkbox'
import RoleGate from '@/components/bloc/auth/RoleGate'
import { RoleClinique } from '@/lib/auth/role-clinique'

const SERVICES_CLINIQUES = [
  'Médecine Interne', 'Chirurgie', 'Réanimation', 'Soins Intensifs',
  'Unité de Surveillance Continue', 'Médecine d\'Urgence', 'Cardiologie',
  'Pneumologie', 'Neurologie', 'Gastro-entérologie'
]

export default function SortieSalleReveilPage() {
  return (
    <RoleGate allowedRoles={[RoleClinique.ANESTHESISTE]} message="Seul l'anesthésiste a accès à la salle de réveil.">
      <Suspense fallback={<div>Chargement...</div>}>
        <SortieSalleReveilPageContent />
      </Suspense>
    </RoleGate>
  )
}

function SortieSalleReveilPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'DUPONT Jean-Marc'
  const scoreSCCREId = searchParams.get('scoreSCCREId') || ''
  const scoreTotal = Number(searchParams.get('scoreTotal') || '0')

  const [checklist, setChecklist] = useState({
    signesVitauxStables: false,
    douleurControlee: false,
    prescriptionsFaites: false,
    familleInformee: false
  })
  const [orientation, setOrientation] = useState<'origine' | 'autres'>('origine')
  const [serviceChoisi, setServiceChoisi] = useState('')
  const [anesthesistes, setAnesthesistes] = useState<any[]>([])
  const [medecinId, setMedecinId] = useState('')
  const [loading, setLoading] = useState(false)
  const { peutValiderSortieReveil, roleName } = useRole()

  useEffect(() => {
    medecinService.getAll({ role: 'ANESTHESISTE', limite: 100 }).then((data: any) => {
      setAnesthesistes(Array.isArray(data) ? data : data?.data || [])
    }).catch(console.error)
  }, [])

  const checklistComplete = Object.values(checklist).every(Boolean)
  const peutSortir = scoreTotal >= 9 && checklistComplete && !!medecinId && peutValiderSortieReveil

  const handleAutoriserSortie = async () => {
    if (!peutSortir) return
    setLoading(true)
    try {
      await apiClient.post('/sorties-reveil', {
        patientId,
        scoreSCCREId,
        medecinId,
        dateHeureSortie: new Date().toISOString(),
        versServiceOrigine: orientation === 'origine',
        autresServicesDestination: orientation === 'autres' ? [serviceChoisi] : [],
        checklistSortie: checklist
      })
      alert('✅ Sortie autorisée avec succès !')
      router.push('/bloc/archives')
    } catch (err) {
      console.error(err)
      alert('❌ Erreur lors de l\'autorisation de sortie')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-8 py-4 border-b border-[#c7dde9]">
        <h2 className="font-headline font-extrabold text-[#00478d] text-2xl">Sortie de Salle de Réveil</h2>
      </header>

      <div className="p-8 max-w-3xl mx-auto space-y-8">
        {/* Contexte patient */}
        <div className="bg-[#d5ecf8] p-4 rounded-xl flex items-center space-x-6">
          <div><p className="text-[10px] text-[#424752] font-bold uppercase">Patient</p><p className="font-bold text-[#00478d]">{patientNom}</p></div>
          <div><p className="text-[10px] text-[#424752] font-bold uppercase">Score SCCRE</p><p className={`font-bold ${scoreTotal >= 9 ? 'text-[#006a6a]' : 'text-[#940010]'}`}>{scoreTotal}/10</p></div>
          <div className="flex-1">
            <label className="text-[10px] text-[#424752] font-bold uppercase mb-0.5 block">Anesthésiste autorisant la sortie</label>
            <select value={medecinId} onChange={e => setMedecinId(e.target.value)} className="w-full bg-white/70 border-none rounded-lg px-2 py-1.5 text-sm font-bold text-[#00478d]">
              <option value="">— Sélectionner —</option>
              {anesthesistes.map((m: any) => <option key={m.id} value={m.id}>{m.nom} {m.prenom}</option>)}
            </select>
          </div>
        </div>

        {/* Checklist de sortie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-white/40">
          <h3 className="font-bold text-lg text-[#00478d] mb-4">Checklist de sortie</h3>
          <div className="space-y-3">
            {[
              { key: 'signesVitauxStables', label: 'Signes vitaux stables' },
              { key: 'douleurControlee', label: 'Douleur contrôlée' },
              { key: 'prescriptionsFaites', label: 'Prescriptions faites' },
              { key: 'familleInformee', label: 'Famille informée' },
            ].map(item => (
              <label key={item.key} className="flex items-center space-x-3 p-3 rounded-lg bg-[#e6f6ff] border border-[#c7dde9]/20 cursor-pointer">
                <Checkbox checked={checklist[item.key as keyof typeof checklist]}
                  onChange={e => setChecklist({...checklist, [item.key]: e.target.checked})} />
                <span className="font-medium">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Orientation */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-white/40">
          <h3 className="font-bold text-lg text-[#00478d] mb-4">Orientation du patient</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 rounded-lg border border-[#c7dde9] cursor-pointer">
              <input type="radio" name="orient" checked={orientation === 'origine'} onChange={() => setOrientation('origine')} className="w-5 h-5 text-[#00478d]" />
              <span className="font-bold">Service d'origine</span>
            </label>
            <label className="flex items-center space-x-3 p-3 rounded-lg border border-[#c7dde9] cursor-pointer">
              <input type="radio" name="orient" checked={orientation === 'autres'} onChange={() => setOrientation('autres')} className="w-5 h-5 text-[#00478d]" />
              <span className="font-bold">Autres services</span>
            </label>
            {orientation === 'autres' && (
              <select value={serviceChoisi} onChange={e => setServiceChoisi(e.target.value)}
                className="w-full mt-2 border border-[#c7dde9] rounded-xl p-3 text-sm">
                <option value="">Sélectionner un service...</option>
                {SERVICES_CLINIQUES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Bouton Autoriser la sortie */}
        <button onClick={handleAutoriserSortie} disabled={!peutSortir || loading}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center space-x-2 ${
            peutSortir ? 'bg-gradient-to-br from-[#00478d] to-[#005eb8] hover:shadow-[#00478d]/40 active:scale-95' : 'bg-gray-400 cursor-not-allowed'
          }`}>
          <span className="material-symbols-outlined">check_circle</span>
          <span>{loading ? 'Autorisation en cours...' : !peutValiderSortieReveil ? 'Réservé à l\'anesthésiste' : scoreTotal < 9 ? 'Score insuffisant (< 9)' : !checklistComplete ? 'Checklist incomplète' : !medecinId ? 'Sélectionnez un anesthésiste' : 'Autoriser la sortie'}</span>
        </button>
        {!peutSortir && (
          <p className="text-center text-xs text-[#940010] font-bold">
            {!peutValiderSortieReveil ? `⚠️ Seul un anesthésiste peut autoriser la sortie${roleName ? ` (votre rôle : ${roleName})` : ''}.` : scoreTotal < 9 ? '⚠️ Score SCCRE doit être ≥ 9 pour autoriser la sortie.' : !checklistComplete ? '⚠️ Tous les éléments de la checklist doivent être cochés.' : '⚠️ Sélectionnez l\'anesthésiste qui autorise la sortie.'}
          </p>
        )}
      </div>
    </main>
  )
}
