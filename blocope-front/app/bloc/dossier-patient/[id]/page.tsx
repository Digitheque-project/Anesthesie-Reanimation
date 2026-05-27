'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { patientService } from '@/lib/api'

export default function DossierPatientPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (patientId) {
      patientService.getById(patientId).then(data => {
        setPatient(data)
        setLoading(false)
      }).catch(err => {
        console.error(err)
        setLoading(false)
      })
    }
  }, [patientId])

  if (loading) return <main className="p-4">Chargement du dossier...</main>
  if (!patient) return <main className="p-4">Patient introuvable</main>

  const p = patient

  return (
    <main className="p-4">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline mb-3">
        <span className="material-symbols-outlined">arrow_back</span> Retour
      </button>

      <h1 className="text-3xl font-extrabold text-on-surface mb-2">📋 Dossier Patient</h1>
      <p className="text-sm text-on-surface-variant mb-4">Prescription et informations médicales</p>

      {/* En-tête Patient */}
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

      {/* Prescription */}
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
      </div>

      {/* Alertes & Risques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span> Alertes
          </h3>
          <p className="text-sm font-bold text-red-800">{p.alertes || 'Aucune alerte'}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <h3 className="text-lg font-bold text-orange-700 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">bloodtype</span> Risque hémorragique
          </h3>
          <p className="text-sm font-bold text-orange-800">{p.risqueHemorragique || 'Non évalué'}</p>
        </div>
      </div>

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
