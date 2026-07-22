'use client'

import { Suspense, useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { patientService, notificationService, planningService } from '@/lib/api'
import ModalPlanifierRDV from '@/components/bloc/notification-cpa/ModalPlanifierRDV'
import DossierPatientTabs from '@/components/bloc/dossier-patient/DossierPatientTabs'
import { useRole } from '@/lib/hooks/useRole'
import { obtenirSessionValide } from '@/lib/auth/central-session'
import { libelleUrgence, styleUrgence } from '@/lib/urgence'
import { formaterNomPatient } from '@/lib/patient'

export default function DossierPatientPage() {
  return (
    <Suspense fallback={<main className="p-4">Chargement du dossier...</main>}>
      <DossierPatientPageContent />
    </Suspense>
  )
}

function DossierPatientPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = params.id as string
  const notifId = searchParams.get('notifId') || ''

  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPlanifier, setShowPlanifier] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { peutPlanifierCpa, roleName } = useRole()

  const charger = () => {
    setLoading(true)
    return patientService.getById(patientId).then(data => {
      setPatient(data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }

  useEffect(() => {
    if (patientId) charger()
  }, [patientId])

  const handleValiderPlanification = async (formData: any) => {
    try {
      setSubmitting(true)
      const [h, m] = (formData.heureRDV || '09:00').split(':').map(Number)
      const fin = new Date()
      fin.setHours(h, m + 30)
      const heureFin = fin.toTimeString().split(' ')[0].substring(0, 5)

      const session = obtenirSessionValide()
      const responsable = session ? `${session.payload.firstname} ${session.payload.name}`.trim() : undefined

      await planningService.reserverCreneau({
        patientId,
        date: formData.dateRDV || new Date().toISOString().split('T')[0],
        heureDebut: formData.heureRDV || '09:00',
        heureFin,
        salle: formData.lieuRDV || 'Salle CPA',
        type: formData.typeRDV || 'CPA',
        responsable,
      })

      if (notifId) {
        await notificationService.planifierRDV(notifId)
      }

      alert('✅ Rendez-vous CPA planifié avec succès ! Le service d\'origine a été notifié.')
      setShowPlanifier(false)
      router.push('/bloc/notification-cpa')
    } catch (err: any) {
      alert('❌ Erreur : ' + (err.response?.data?.message || err.message || 'Erreur inconnue'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <main className="p-4">Chargement du dossier...</main>
  if (!patient) return <main className="p-4">Patient introuvable</main>

  const p = patient

  return (
    <main className="p-4">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline mb-3">
        <span className="material-symbols-outlined">arrow_back</span> Retour
      </button>

      <h1 className="text-3xl font-extrabold text-on-surface mb-2">📁 Dossier Patient</h1>
      <p className="text-sm text-on-surface-variant mb-4">Dossier médical complet et suivi de la prise en charge</p>

      {/* En-tête Patient */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {p.nom?.charAt(0)}{p.prenom?.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-primary">{formaterNomPatient(p)}</h2>
            <p className="text-sm text-on-surface-variant">
              {p.dateNaissance ? `${new Date().getFullYear() - new Date(p.dateNaissance).getFullYear()} ans` : ''} • {p.sexe} • {p.groupeSanguin}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <div><span className="text-xs font-bold text-gray-500 uppercase">Chambre</span><p>{p.chambre || '—'}</p></div>
          <div><span className="text-xs font-bold text-gray-500 uppercase">Urgence</span><p className={`font-bold uppercase ${styleUrgence(p.niveauUrgence).texte}`}>{libelleUrgence(p.niveauUrgence)}</p></div>
          <div><span className="text-xs font-bold text-gray-500 uppercase">Statut</span><p className="font-bold text-blue-600">{p.statut || '—'}</p></div>
        </div>
      </div>

      {/* Accès direct au dossier patient complet (Service Clinique), en lecture seule */}
      <div className="flex items-center gap-3 my-5">
        <span className="material-symbols-outlined text-on-surface-variant">folder_shared</span>
        <h2 className="text-sm font-extrabold text-on-surface-variant uppercase tracking-wide">Dossier Patient</h2>
        <div className="flex-1 h-px bg-outline-variant/30" />
      </div>
      <div className="mb-5">
        <DossierPatientTabs patientId={patientId} />
      </div>

      {/* Prescription — alertes et risque hémorragique regroupés dans la même plage que la
          prescription chirurgicale, pour que le prescripteur ait toute l'information critique
          d'un coup d'œil sans devoir chercher plus bas dans la page */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-3">
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">clinical_notes</span> Prescription chirurgicale
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
          <div className="p-3 bg-blue-50 rounded-lg">
            <span className="text-xs font-bold text-gray-500 uppercase">Intervention prévue</span>
            <p className="font-bold text-lg">{p.libelle || 'Non spécifiée'}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <span className="text-xs font-bold text-gray-500 uppercase">Type de chirurgie</span>
            <p className="font-bold">{p.typeChirurgie || '—'}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <span className="text-xs font-bold text-gray-500 uppercase">Date et heure prévues de l'opération</span>
            <p className="font-bold">
              {p.dateIntervention
                ? new Date(p.dateIntervention).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Non communiquée'}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <span className="text-xs font-bold text-gray-500 uppercase">Chirurgien</span>
            <p className="font-bold">{p.chirurgien_nom || '—'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <span className="text-xs font-bold text-red-700 uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">warning</span> Alertes
            </span>
            <p className="font-bold text-red-800 mt-1">{p.alertes || 'Aucune alerte'}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <span className="text-xs font-bold text-orange-700 uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">bloodtype</span> Risque hémorragique
            </span>
            <p className="font-bold text-orange-800 mt-1">{p.risqueHemorragique || 'Non évalué'}</p>
          </div>
        </div>
      </div>

      {/* Suivi CPA / planification — après la prescription, puisqu'on ne planifie qu'une fois la
          prescription chirurgicale consultée */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-3">
        <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined">fact_check</span> Suivi CPA
        </h3>

        {p.statut === 'CPA_INAPTE' ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-bold text-red-700">❌ Patient inapte pour le CPA</p>
            {p.motifRefusCpa && <p className="text-sm text-red-800 mt-1">Motif : {p.motifRefusCpa}</p>}
          </div>
        ) : p.statut && p.statut !== 'EN_ATTENTE_CPA' ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-bold text-green-700">✅ CPA réalisée</p>
            <p className="text-xs text-green-800 mt-1">La décision d'aptitude est prise pendant la consultation CPA proprement dite.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-on-surface-variant mb-3">
              La décision d'aptitude (Apte / En attente / Refusé) se fait pendant la consultation CPA. Depuis cette fiche, vous pouvez planifier son rendez-vous.
            </p>
            {!peutPlanifierCpa && (
              <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                Planification réservée au Responsable CPA ou au Major{roleName ? ` (votre rôle : ${roleName})` : ''}.
              </div>
            )}
            <button onClick={() => setShowPlanifier(true)} disabled={submitting || !peutPlanifierCpa}
              className="w-full sm:w-auto px-4 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">event_available</span>
              Planifier le rendez-vous CPA
            </button>
          </>
        )}
      </div>

      <ModalPlanifierRDV
        isOpen={showPlanifier}
        onClose={() => setShowPlanifier(false)}
        onValider={handleValiderPlanification}
        patientNom={formaterNomPatient(p)}
        intervention={p.libelle || ''}
        estUrgent={false}
      />

      {/* Consignes */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">list_alt</span> Consignes pré-opératoires
        </h3>
        <p className="text-sm bg-gray-50 p-4 rounded-lg">{p.consignes || 'Aucune consigne'}</p>
      </div>
    </main>
  )
}
