'use client'

import { Suspense, useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { patientService, notificationService, planningService, cpaService } from '@/lib/api'
import ModalPlanifierRDV from '@/components/bloc/notification-cpa/ModalPlanifierRDV'
import DossierMedicalPanel from '@/components/bloc/dossier-patient/DossierMedicalPanel'
import { useRole } from '@/lib/hooks/useRole'
import { obtenirSessionValide } from '@/lib/auth/central-session'

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
  const [showDossierMedical, setShowDossierMedical] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [derniereCpa, setDerniereCpa] = useState<any>(null)
  const { peutPlanifierCpa, peutValiderCpaProfesseur, roleName } = useRole()

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
    if (patientId) {
      charger()
      cpaService.getAll(1, 10).then((res: any) => {
        const cpas = res?.data || []
        const cpaPatient = cpas.find((c: any) => c.patientId === patientId)
        if (cpaPatient) setDerniereCpa(cpaPatient)
      }).catch(console.error)
    }
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
    <main className="p-4 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline mb-3">
        <span className="material-symbols-outlined">arrow_back</span> Retour
      </button>

      <h1 className="text-3xl font-extrabold text-on-surface mb-2">📋 Detail prescription</h1>
      <p className="text-sm text-on-surface-variant mb-4">Prescription et informations médicales</p>

      {/* 1) En-tête Patient — Informations du patient */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {p.nom?.charAt(0)}{p.prenom?.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-primary">{p.nom} {p.prenom}</h2>
            <p className="text-sm text-on-surface-variant">
              {p.dateNaissance ? `${new Date().getFullYear() - new Date(p.dateNaissance).getFullYear()} ans` : ''} • {p.sexe} • {p.groupeSanguin}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div><span className="text-xs font-bold text-gray-500 uppercase">ID Dossier</span><p className="font-bold">{p.idDossier || '—'}</p></div>
          <div><span className="text-xs font-bold text-gray-500 uppercase">Chambre</span><p>{p.chambre || '—'}</p></div>
          <div><span className="text-xs font-bold text-gray-500 uppercase">Urgence</span><p className={`font-bold ${p.niveauUrgence === 'STAT' || p.niveauUrgence === 'URGENT' ? 'text-red-600' : 'text-green-600'}`}>{p.niveauUrgence || '—'}</p></div>
          <div><span className="text-xs font-bold text-gray-500 uppercase">Statut</span><p className="font-bold text-blue-600">{p.statut || '—'}</p></div>
        </div>
      </div>

      {/* 2) Dossier Patient — Option pour voir le dossier du patient (service clinique) */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-3">
        <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined">folder_shared</span> Dossier Patient
        </h3>
        <p className="text-xs text-gray-400 mb-3">Consultez le dossier médical complet du patient (antécédents, examens, alertes).</p>
        <button
          onClick={() => setShowDossierMedical(true)}
          className="w-full sm:w-auto px-4 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">visibility</span>
          Voir le dossier médical
        </button>
      </div>

      {/* Modal Dossier Médical */}
      {showDossierMedical && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowDossierMedical(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">folder_shared</span> Dossier médical
              </h3>
              <button onClick={() => setShowDossierMedical(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <DossierMedicalPanel patientId={patientId} />
            </div>
          </div>
        </div>
      )}

      {/* 3) Détails Prescription */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-3">
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">clinical_notes</span> Prescription chirurgicale
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <span className="text-xs font-bold text-gray-500 uppercase">Intervention prévue</span>
            <p className="font-bold text-lg">{p.libelle || 'Non spécifiée'}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <span className="text-xs font-bold text-gray-500 uppercase">Type de chirurgie</span>
            <p className="font-bold">{p.typeChirurgie || '—'}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <span className="text-xs font-bold text-gray-500 uppercase">Date d'intervention</span>
            <p className="font-bold">{p.dateIntervention ? new Date(p.dateIntervention).toLocaleDateString('fr-FR') : '—'}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <span className="text-xs font-bold text-gray-500 uppercase">Chirurgien</span>
            <p className="font-bold">{p.chirurgien_nom || '—'}</p>
          </div>
        </div>

        {/* Alertes & Risques (dans la prescription) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <span className="text-xs font-bold text-red-600 uppercase">Alertes</span>
            <p className="text-sm font-bold text-red-800">{p.alertes || 'Aucune alerte'}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <span className="text-xs font-bold text-orange-600 uppercase">Risque hémorragique</span>
            <p className="text-sm font-bold text-orange-800">{p.risqueHemorragique || 'Non évalué'}</p>
          </div>
        </div>

        {/* Consignes pré-opératoires */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase">Consignes pré-opératoires</span>
          <p className="text-sm mt-1">{p.consignes || 'Aucune consigne'}</p>
        </div>
      </div>

      {/* Statut Validation CPA */}
      {derniereCpa && (
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-3">
          <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">verified_user</span> Validation CPA
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <span className="text-xs font-bold text-gray-500 uppercase">Anesthésiste réalisant</span>
              <p className="text-sm font-bold">{derniereCpa.anesthesiste?.prenom} {derniereCpa.anesthesiste?.nom || '—'}</p>
            </div>
            <div className={`p-3 rounded-lg ${derniereCpa.statutValidation === 'VALIDE_PAR_PROFESSEUR' ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <span className="text-xs font-bold uppercase">{derniereCpa.statutValidation === 'VALIDE_PAR_PROFESSEUR' ? 'Validée par le professeur' : 'En attente de validation professeur'}</span>
              {derniereCpa.statutValidation === 'VALIDE_PAR_PROFESSEUR' ? (
                <p className="text-sm font-bold text-green-700 mt-1">
                  {derniereCpa.valideParProfesseur?.prenom} {derniereCpa.valideParProfesseur?.nom || '—'}
                  {derniereCpa.dateValidationProfesseur && (
                    <span className="text-xs font-normal text-green-600 block">
                      le {new Date(derniereCpa.dateValidationProfesseur).toLocaleDateString('fr-FR')} à {new Date(derniereCpa.dateValidationProfesseur).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-xs text-amber-700 mt-1">En attente de validation par le professeur responsable CPA.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4) Planifier le rendez-vous */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-3">
        <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined">event_available</span> Planifier le rendez-vous
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
        patientNom={`${p.nom || ''} ${p.prenom || ''}`.trim() || 'Patient'}
        intervention={p.libelle || ''}
        estUrgent={false}
      />
    </main>
  )
}
