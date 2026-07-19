'use client'

import { useEffect, useState } from 'react'
import { patientService } from '@/lib/api'

interface DossierMedicalPanelProps {
  patientId: string
}

interface DossierMedical {
  antecedents: any[]
  diagnostics: any[]
  histoireMaladie: any[]
  alertesUrgentes: any[]
  dernierExamen: any[]
  examensComplementaires: any[]
  suivis: any[]
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

type Accent = 'blue' | 'indigo' | 'violet' | 'red' | 'amber' | 'orange' | 'emerald'

const ACCENT_CLASSES: Record<Accent, { carte: string; badge: string; icone: string }> = {
  blue: { carte: 'border-blue-200 bg-blue-50/60', badge: 'bg-blue-100 text-blue-700', icone: 'text-blue-600' },
  indigo: { carte: 'border-indigo-200 bg-indigo-50/60', badge: 'bg-indigo-100 text-indigo-700', icone: 'text-indigo-600' },
  violet: { carte: 'border-violet-200 bg-violet-50/60', badge: 'bg-violet-100 text-violet-700', icone: 'text-violet-600' },
  red: { carte: 'border-red-200 bg-red-50/60', badge: 'bg-red-100 text-red-700', icone: 'text-red-600' },
  amber: { carte: 'border-amber-200 bg-amber-50/60', badge: 'bg-amber-100 text-amber-700', icone: 'text-amber-600' },
  orange: { carte: 'border-orange-200 bg-orange-50/60', badge: 'bg-orange-100 text-orange-700', icone: 'text-orange-600' },
  emerald: { carte: 'border-emerald-200 bg-emerald-50/60', badge: 'bg-emerald-100 text-emerald-700', icone: 'text-emerald-600' },
}

function CarteEnregistrement({ enregistrement, accent }: { enregistrement: Record<string, any>; accent: Accent }) {
  const champs = champsUtiles(enregistrement)
  const { carte } = ACCENT_CLASSES[accent]

  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${carte}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
        {champs.map(([cle, valeur]) => (
          <div key={cle} className="text-sm">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{formaterLabel(cle)}</span>
            <p className="text-gray-800 leading-snug">{Array.isArray(valeur) ? valeur.join(', ') : String(valeur)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Section({ titre, icone, enregistrements, accent, vide }: { titre: string; icone: string; enregistrements: any[]; accent: Accent; vide: string }) {
  const { badge, icone: iconeClasse } = ACCENT_CLASSES[accent]
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${badge}`}>
          <span className={`material-symbols-outlined text-lg ${iconeClasse}`}>{icone}</span>
        </span>
        <h4 className="text-sm font-bold text-on-surface">{titre}</h4>
        {enregistrements.length > 0 && (
          <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${badge}`}>
            {enregistrements.length}
          </span>
        )}
      </div>
      {enregistrements.length === 0 ? (
        <p className="text-xs text-gray-400 italic pl-10">{vide}</p>
      ) : (
        <div className="space-y-2 pl-1">
          {enregistrements.map((e, i) => <CarteEnregistrement key={e.id || i} enregistrement={e} accent={accent} />)}
        </div>
      )}
    </div>
  )
}

export default function DossierMedicalPanel({ patientId }: DossierMedicalPanelProps) {
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(false)
  const [dossier, setDossier] = useState<DossierMedical | null>(null)

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
      <h3 className="text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <span className="material-symbols-outlined">folder_shared</span> Dossier médical
      </h3>
      <p className="text-xs text-gray-400 mb-4">Antécédents, diagnostics, histoire de la maladie, alertes, examens et suivi — issus du dossier patient partagé.</p>

      {loading ? (
        <p className="text-sm text-gray-500">Chargement du dossier médical...</p>
      ) : erreur ? (
        <p className="text-sm text-gray-400 italic">Dossier médical indisponible pour le moment.</p>
      ) : (
        <div className="space-y-5">
          <Section titre="Alertes médicales urgentes" icone="emergency" enregistrements={dossier?.alertesUrgentes || []} accent="red" vide="Aucune alerte urgente." />
          <Section titre="Antécédents actifs" icone="history_edu" enregistrements={dossier?.antecedents || []} accent="blue" vide="Aucun antécédent actif renseigné." />
          <Section titre="Diagnostics retenus" icone="fact_check" enregistrements={dossier?.diagnostics || []} accent="indigo" vide="Aucun diagnostic renseigné." />
          <Section titre="Histoire de la maladie actuelle" icone="menu_book" enregistrements={dossier?.histoireMaladie || []} accent="violet" vide="Aucune histoire de la maladie renseignée." />
          <Section titre="Dernier examen physique" icone="stethoscope" enregistrements={dossier?.dernierExamen || []} accent="amber" vide="Aucun examen physique enregistré." />
          <Section titre="Examens complémentaires urgents" icone="biotech" enregistrements={dossier?.examensComplementaires || []} accent="orange" vide="Aucun examen complémentaire urgent." />
          <Section titre="Suivi / Évolution" icone="timeline" enregistrements={dossier?.suivis || []} accent="emerald" vide="Aucun suivi enregistré." />
        </div>
      )}
    </div>
  )
}
