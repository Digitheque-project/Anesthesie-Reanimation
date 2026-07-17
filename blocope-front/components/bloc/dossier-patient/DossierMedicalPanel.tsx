'use client'

import { useEffect, useState } from 'react'
import { patientService } from '@/lib/api'

interface DossierMedicalPanelProps {
  patientId: string
}

// Champs techniques communs à tous les enregistrements du service Dossier Patient — jamais
// affichés directement, ce ne sont pas des données cliniques.
const CHAMPS_TECHNIQUES = new Set([
  'id', 'chuId', 'serviceId', 'patientId', 'createdAt', 'updatedAt', 'createdBy', '__v',
])

const formaterLabel = (cle: string) =>
  cle
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())

const champsUtiles = (obj: Record<string, any>) =>
  Object.entries(obj).filter(([cle, valeur]) => {
    if (CHAMPS_TECHNIQUES.has(cle)) return false
    if (valeur === null || valeur === undefined || valeur === '') return false
    if (Array.isArray(valeur) && valeur.length === 0) return false
    return true
  })

function CarteEnregistrement({ enregistrement, accent }: { enregistrement: Record<string, any>; accent: 'red' | 'amber' | 'blue' }) {
  const champs = champsUtiles(enregistrement)
  const accentClasses = {
    red: 'border-red-200 bg-red-50',
    amber: 'border-amber-200 bg-amber-50',
    blue: 'border-blue-100 bg-blue-50/50',
  }[accent]

  return (
    <div className={`rounded-lg border p-3 ${accentClasses}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {champs.map(([cle, valeur]) => (
          <div key={cle} className="text-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">{formaterLabel(cle)}</span>
            <p className="text-gray-800">{Array.isArray(valeur) ? valeur.join(', ') : String(valeur)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Section({ titre, icone, enregistrements, accent, vide }: { titre: string; icone: string; enregistrements: any[]; accent: 'red' | 'amber' | 'blue'; vide: string }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">{icone}</span> {titre}
      </h4>
      {enregistrements.length === 0 ? (
        <p className="text-xs text-gray-400 italic">{vide}</p>
      ) : (
        <div className="space-y-2">
          {enregistrements.map((e, i) => <CarteEnregistrement key={e.id || i} enregistrement={e} accent={accent} />)}
        </div>
      )}
    </div>
  )
}

export default function DossierMedicalPanel({ patientId }: DossierMedicalPanelProps) {
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(false)
  const [dossier, setDossier] = useState<{ antecedents: any[]; alertesUrgentes: any[]; dernierExamen: any[] } | null>(null)

  useEffect(() => {
    if (!patientId) return
    setLoading(true)
    setErreur(false)
    patientService.getDossierMedical(patientId)
      .then(setDossier)
      .catch(() => setErreur(true))
      .finally(() => setLoading(false))
  }, [patientId])

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border mb-3">
      <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined">folder_shared</span> Dossier médical
      </h3>
      <p className="text-xs text-gray-400 mb-3">Antécédents, alertes et dernier examen physique — issus du dossier patient partagé.</p>

      {loading ? (
        <p className="text-sm text-gray-500">Chargement du dossier médical...</p>
      ) : erreur ? (
        <p className="text-sm text-gray-400 italic">Dossier médical indisponible pour le moment.</p>
      ) : (
        <div className="space-y-4">
          <Section titre="Antécédents actifs" icone="history_edu" enregistrements={dossier?.antecedents || []} accent="blue" vide="Aucun antécédent actif renseigné." />
          <Section titre="Alertes médicales urgentes" icone="emergency" enregistrements={dossier?.alertesUrgentes || []} accent="red" vide="Aucune alerte urgente." />
          <Section titre="Dernier examen physique" icone="stethoscope" enregistrements={dossier?.dernierExamen || []} accent="amber" vide="Aucun examen physique enregistré." />
        </div>
      )}
    </div>
  )
}
