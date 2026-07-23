'use client'

import { useEffect, useState } from 'react'
import { patientService } from '@/lib/api'

interface DossierPatientTabsProps {
  patientId: string
}

interface DossierComplet {
  observations: any[]
  diagnostics: any[]
  antecedents: any[]
  histoiresMaladie: any[]
  examensPhysiques: any[]
  examensComplementaires: any[]
  suivis: any[]
  protocolesOperatoires: any[]
  sortie: any[]
  prescriptions: any[]
}

// Catalogue des types de prescriptions (miroir de prescription_front/components/prescription/
// HistoriqueForm.tsx) — le type "bloc" est volontairement absent : c'est la prescription qui a
// déclenché l'admission du patient dans NOTRE service, déjà visible ailleurs dans cette
// interface (section Prescription chirurgicale), pas la peine de la dupliquer ici.
const PRESCRIPTION_TYPES: { id: string; label: string; icone: string; couleur: string }[] = [
  { id: 'medicale', label: 'Médicamenteuse', icone: 'medication', couleur: '#3b82f6' },
  { id: 'nonMedicale', label: 'Non médicamenteuse', icone: 'self_care', couleur: '#8b5cf6' },
  { id: 'surveillance', label: 'Surveillance', icone: 'monitor_heart', couleur: '#10b981' },
  { id: 'transfusion', label: 'Transfusion', icone: 'bloodtype', couleur: '#ef4444' },
  { id: 'labo', label: 'Laboratoire', icone: 'science', couleur: '#f59e0b' },
  { id: 'imagerie', label: 'Imagerie', icone: 'radiology', couleur: '#06b6d4' },
  { id: 'eeg', label: 'EEG', icone: 'neurology', couleur: '#6366f1' },
  { id: 'kine', label: 'Kinésithérapie', icone: 'exercise', couleur: '#84cc16' },
  { id: 'endoscopie', label: 'Endoscopie', icone: 'visibility', couleur: '#f97316' },
  { id: 'dialyse', label: 'Dialyse', icone: 'water_full', couleur: '#14b8a6' },
  { id: 'anapath', label: 'Anapath', icone: 'biotech', couleur: '#ec4899' },
]
const prescriptionMeta = (type: string) => PRESCRIPTION_TYPES.find((t) => t.id === type)
const STATUTS_OK = new Set(['ACTIVE', 'EXECUTEE', 'validé', 'CREEE'])
const STATUTS_KO = new Set(['ANNULEE', 'REJETEE', 'EXPIREE'])

const resumePrescription = (item: any, type: string): string => {
  switch (type) {
    case 'medicale': return item.medicament || item.nom || 'Médicament'
    case 'nonMedicale': return item.type || item.description || 'Non médicamenteuse'
    case 'surveillance': return item.parametre || item.type || 'Surveillance'
    case 'transfusion': return item.produit || item.groupe || 'Transfusion'
    case 'labo': return item.examen || item.analyse || 'Analyse laboratoire'
    case 'imagerie': return item.typeExamen || item.examen || item.type || 'Imagerie'
    case 'eeg': return item.typeEEG || item.type || 'EEG'
    case 'kine': return item.typeKine || item.type || 'Kinésithérapie'
    case 'endoscopie': return item.type || 'Endoscopie'
    case 'dialyse': return item.type || 'Dialyse'
    case 'anapath': return item.examen || item.type || 'Anapath'
    default: return item.description || item.nom || '—'
  }
}

type OngletId = 'observation' | 'diagnostic' | 'suivi' | 'prescription' | 'compteRendu' | 'paraclinique' | 'sortie' | 'historique'

const ONGLETS: { id: OngletId; label: string; icone: string }[] = [
  { id: 'observation', label: 'Observation médicale', icone: 'stethoscope' },
  { id: 'diagnostic', label: 'Diagnostic', icone: 'fact_check' },
  { id: 'suivi', label: 'Suivi / Évolution', icone: 'monitoring' },
  { id: 'prescription', label: 'Prescription', icone: 'prescriptions' },
  { id: 'compteRendu', label: 'Compte-rendu opératoire', icone: 'content_cut' },
  { id: 'paraclinique', label: 'Résultats paracliniques', icone: 'biotech' },
  { id: 'sortie', label: 'Sortie', icone: 'logout' },
  { id: 'historique', label: 'Historique', icone: 'history' },
]

const formaterDate = (v?: string | null, avecHeure = false) => {
  if (!v) return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return avecHeure
    ? d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'gray' | 'red' | 'green' | 'amber' | 'blue' }) {
  const classes: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700',
    red: 'bg-red-100 text-red-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${classes[tone]}`}>{children}</span>
}

function Constante({ icone, label, valeur, unite }: { icone: string; label: string; valeur: any; unite?: string }) {
  if (valeur === undefined || valeur === null || valeur === '') return null
  return (
    <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1.5 rounded-lg border border-outline-variant/20">
      <span className="material-symbols-outlined text-sm text-primary">{icone}</span>
      <div className="leading-tight">
        <p className="text-[9px] font-bold text-on-surface-variant uppercase">{label}</p>
        <p className="text-xs font-extrabold text-on-surface">{valeur}{unite}</p>
      </div>
    </div>
  )
}

function Vide({ texte }: { texte: string }) {
  return <p className="text-sm text-on-surface-variant italic py-6 text-center">{texte}</p>
}

function CarteBase({ enTete, children }: { enTete: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-4 space-y-3">
      {enTete}
      {children}
    </div>
  )
}

function ChampDetail({ label, valeur }: { label: string; valeur: unknown }) {
  if (valeur === undefined || valeur === null || valeur === '') return null
  return (
    <div className="text-xs mb-1.5">
      <span className="font-bold text-on-surface-variant">{label} : </span>
      <span className="text-on-surface">{String(valeur)}</span>
    </div>
  )
}

// Détails spécifiques par type — champs choisis d'après le modèle de référence
// (prescription_front/components/prescription/HistoriqueForm.tsx), simplifiés pour rester
// lisibles dans ce contexte de consultation (pas de saisie).
function DetailsPrescription({ item, type }: { item: any; type: string }) {
  const sousListe = (titre: string, liste: any[], champs: [string, (x: any) => unknown][]) => (
    <div className="mt-3">
      <p className="text-xs font-extrabold text-on-surface-variant uppercase mb-2">{titre} ({liste.length})</p>
      <div className="space-y-2">
        {liste.map((x, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-lg p-2.5">
            {champs.map(([label, get]) => <ChampDetail key={label} label={label} valeur={get(x)} />)}
          </div>
        ))}
      </div>
    </div>
  )

  switch (type) {
    case 'medicale':
      return (
        <div>
          <ChampDetail label="Alertes" valeur={item.alertes} />
          <ChampDetail label="Renseignements cliniques" valeur={item.renseignements} />
          <ChampDetail label="Remarques" valeur={item.remarques} />
          {item.medicaments?.length > 0 && sousListe('Médicaments prescrits', item.medicaments, [
            ['Nom', (m) => m.nom], ['Dose', (m) => m.dose], ['Voie', (m) => m.voie],
            ['Fréquence', (m) => m.frequence || (m.frequenceType ? `${m.frequenceType} ${m.frequenceValeur || ''}`.trim() : undefined)],
            ['Durée', (m) => m.dureeJours ? `${m.dureeJours} jours` : m.duree], ['Instructions', (m) => m.instructions],
          ])}
        </div>
      )
    case 'nonMedicale':
      return (
        <div>
          <ChampDetail label="Alertes" valeur={item.alertes} />
          {item.items?.length > 0 && sousListe('Prescriptions', item.items, [
            ['Type', (m) => m.typeLabel || m.type], ['Description', (m) => m.description],
            ['Durée', (m) => m.dureeJours ? `${m.dureeJours} jours` : m.duree], ['Instructions', (m) => m.instructions],
          ])}
        </div>
      )
    case 'surveillance':
      return (
        <div>
          <ChampDetail label="Alertes" valeur={item.alertes} />
          <ChampDetail label="Notes" valeur={item.notes} />
          {item.parametres?.length > 0 && sousListe('Paramètres à surveiller', item.parametres, [
            ['Paramètre', (m) => m.parametre], ['Fréquence', (m) => m.frequence], ['Seuil', (m) => m.seuil],
          ])}
        </div>
      )
    case 'transfusion':
      return (
        <div>
          <ChampDetail label="Groupage sanguin" valeur={item.groupage} />
          <ChampDetail label="Hémoglobine" valeur={item.hb} />
          <ChampDetail label="Incidents précédents" valeur={item.incident} />
          {item.produits?.length > 0 && sousListe('Produits sanguins', item.produits, [
            ['Type', (m) => m.produit], ['Quantité', (m) => m.quantite], ['Statut Banque de Sang', (m) => m.statutBanqueSang],
          ])}
        </div>
      )
    case 'labo':
      return (
        <div>
          <ChampDetail label="À jeun" valeur={item.aJeun !== undefined ? (item.aJeun ? 'Oui' : 'Non') : undefined} />
          <ChampDetail label="Renseignements cliniques" valeur={item.renseignements} />
          {item.analyses?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-extrabold text-on-surface-variant uppercase mb-1">Analyses demandées</p>
              {item.analyses.map((a: string, i: number) => <p key={i} className="text-xs">• {a}</p>)}
            </div>
          )}
          <ChampDetail label="Motif de refus" valeur={item.motifRefus} />
        </div>
      )
    case 'imagerie':
      return (
        <div>
          <ChampDetail label="Type d'examen" valeur={item.typeExamen} />
          <ChampDetail label="Statut patient" valeur={item.statutPatient} />
          <ChampDetail label="Renseignements cliniques" valeur={item.renseignements} />
          <ChampDetail label="Motif de refus" valeur={item.motifRefus} />
        </div>
      )
    default:
      return (
        <div>
          <ChampDetail label="Alertes" valeur={item.alertes} />
          <ChampDetail label="Renseignements cliniques" valeur={item.renseignements} />
          <ChampDetail label="Remarques" valeur={item.remarques} />
          <ChampDetail label="Description" valeur={item.description} />
          <ChampDetail label="Motif de refus" valeur={item.motifRefus} />
        </div>
      )
  }
}

function PrescriptionDetailModal({ item, onClose }: { item: any; onClose: () => void }) {
  const meta = prescriptionMeta(item._type)
  const couleur = meta?.couleur || '#1e3a5f'
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 rounded-t-2xl flex items-center justify-between" style={{ background: couleur }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">{meta?.icone || 'description'}</span>
            </div>
            <div>
              <p className="text-white font-extrabold">Prescription {meta?.label || item._type}</p>
              <p className="text-white/75 text-xs">{formaterDate(item.createdAt || item.date, true)}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold">×</button>
        </div>
        <div className="p-6 space-y-4">
          {item.statut && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${STATUTS_OK.has(item.statut) ? 'bg-emerald-50 text-emerald-800' : STATUTS_KO.has(item.statut) ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'}`}>
              <span className="material-symbols-outlined text-lg">{STATUTS_OK.has(item.statut) ? 'check_circle' : STATUTS_KO.has(item.statut) ? 'cancel' : 'pending'}</span>
              <span className="text-sm font-bold">Statut : {item.statut}</span>
            </div>
          )}
          <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
            <div className="bg-surface-container-lowest px-3 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">stethoscope</span>
              <span className="text-[11px] font-extrabold text-primary uppercase">Prescripteur</span>
            </div>
            <div className="p-3">
              {item.nomMedecinPrescripteur ? (
                <p className="text-sm font-bold">Dr {item.nomMedecinPrescripteur}</p>
              ) : <p className="text-sm text-on-surface-variant italic">Prescripteur non renseigné</p>}
              {item.sourceType && <p className="text-xs text-on-surface-variant mt-1">Via {String(item.sourceType).toUpperCase()}</p>}
            </div>
          </div>
          <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
            <div className="bg-surface-container-lowest px-3 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">clinical_notes</span>
              <span className="text-[11px] font-extrabold text-primary uppercase">Détails cliniques</span>
            </div>
            <div className="p-3">
              <DetailsPrescription item={item} type={item._type} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DossierPatientTabs({ patientId }: DossierPatientTabsProps) {
  const [onglet, setOnglet] = useState<OngletId>('observation')
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(false)
  const [dossier, setDossier] = useState<DossierComplet | null>(null)
  const [filtrePrescription, setFiltrePrescription] = useState<string>('all')
  const [prescriptionSelectionnee, setPrescriptionSelectionnee] = useState<any>(null)

  useEffect(() => {
    if (!patientId) return
    setLoading(true)
    setErreur(false)
    patientService.getDossierComplet(patientId)
      .then(setDossier)
      .catch(() => setErreur(true))
      .finally(() => setLoading(false))
  }, [patientId])

  const renderObservation = () => {
    const items = dossier?.observations || []
    if (!items.length) return <Vide texte="Aucune observation médicale enregistrée." />
    return (
      <div className="space-y-3">
        {items.map((o: any, i: number) => (
          <CarteBase key={o.id || i} enTete={
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">{o.observationType || 'Observation'}</p>
                <p className="text-xs text-on-surface-variant">{formaterDate(o.createdAt, true)}</p>
              </div>
              {o.urgencyLevel && <Badge tone={o.urgencyLevel <= 2 ? 'red' : 'amber'}>Niveau {o.urgencyLevel}</Badge>}
            </div>
          }>
            <div className="flex flex-wrap gap-2">
              <Constante icone="monitor_heart" label="TA" valeur={o.systolicBP && o.diastolicBP ? `${o.systolicBP}/${o.diastolicBP}` : null} unite=" mmHg" />
              <Constante icone="favorite" label="FC" valeur={o.heartRate} unite=" bpm" />
              <Constante icone="thermostat" label="Temp" valeur={o.temperature} unite="°C" />
              <Constante icone="air" label="FR" valeur={o.respiratoryRate} unite=" /min" />
              <Constante icone="water_drop" label="SpO2" valeur={o.oxygenSaturation} unite="%" />
              <Constante icone="scale" label="Poids" valeur={o.weight} unite=" kg" />
              <Constante icone="straighten" label="Taille" valeur={o.height} unite=" cm" />
            </div>
            {o.symptoms && <p className="text-sm"><span className="font-bold text-on-surface-variant">Symptômes : </span>{o.symptoms}</p>}
            {o.physicalExamination && <p className="text-sm"><span className="font-bold text-on-surface-variant">Examen physique : </span>{o.physicalExamination}</p>}
            {o.clinicalImpressions && <p className="text-sm"><span className="font-bold text-on-surface-variant">Impressions cliniques : </span>{o.clinicalImpressions}</p>}
          </CarteBase>
        ))}
      </div>
    )
  }

  const renderDiagnostic = () => {
    const items = dossier?.diagnostics || []
    if (!items.length) return <Vide texte="Aucun diagnostic renseigné." />
    return (
      <div className="space-y-3">
        {items.map((d: any, i: number) => (
          <CarteBase key={d.id || i} enTete={
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">{d.icdLabel || d.diagnosticPrincipal || 'Diagnostic'}</p>
                {d.icdCode && <p className="text-xs text-on-surface-variant font-mono">{d.icdCode}</p>}
              </div>
              <div className="flex gap-1">
                {d.isPrimary && <Badge tone="blue">Principal</Badge>}
                <Badge tone={d.type === 'RETENU' ? 'green' : 'amber'}>{d.type === 'RETENU' ? 'Retenu' : 'Suspicion'}</Badge>
              </div>
            </div>
          }>
            {d.diagnosticSecondaire && <p className="text-sm"><span className="font-bold text-on-surface-variant">Secondaire : </span>{d.diagnosticSecondaire}</p>}
            {d.justification && <p className="text-sm"><span className="font-bold text-on-surface-variant">Justification : </span>{d.justification}</p>}
            {d.diagnosticDifferentielle && <p className="text-sm"><span className="font-bold text-on-surface-variant">Diagnostic différentiel : </span>{d.diagnosticDifferentielle}</p>}
            {d.severityScore && <p className="text-sm"><span className="font-bold text-on-surface-variant">Sévérité : </span>{d.severityScore}</p>}
          </CarteBase>
        ))}
      </div>
    )
  }

  const renderSuivi = () => {
    const items = dossier?.suivis || []
    if (!items.length) return <Vide texte="Aucun suivi enregistré." />
    return (
      <div className="space-y-3">
        {items.map((s: any, i: number) => (
          <CarteBase key={s.id || i} enTete={
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-on-surface">{formaterDate(s.createdAt || s.date, true)}</p>
                  {s.signesAlerte && <Badge tone="red">Alerte</Badge>}
                  {s.jourHospitalisation && <Badge tone="gray">{s.jourHospitalisation}</Badge>}
                </div>
                <p className="text-xs text-on-surface-variant">{s.auteur || ''}</p>
              </div>
              {s.etatGeneral && <Badge tone={/stable|bon|améliora/i.test(s.etatGeneral) ? 'green' : 'red'}>{s.etatGeneral}</Badge>}
            </div>
          }>
            <div className="flex flex-wrap gap-2">
              <Constante icone="thermostat" label="Temp" valeur={s.temperature} unite="°C" />
              <Constante icone="monitor_heart" label="TA" valeur={s.taSystolique && s.taDiastolique ? `${s.taSystolique}/${s.taDiastolique}` : null} />
              <Constante icone="favorite" label="FC" valeur={s.frequenceCardiaque} unite=" bpm" />
              <Constante icone="air" label="FR" valeur={s.frequenceRespiratoire} unite=" /min" />
              <Constante icone="psychology" label="Glasgow" valeur={s.glasgow} unite="/15" />
              <Constante icone="sentiment_dissatisfied" label="EVA" valeur={s.evaDouleur} unite="/10" />
            </div>
            {s.examenClinique && <p className="text-sm"><span className="font-bold text-on-surface-variant">Examen clinique : </span>{s.examenClinique}</p>}
            {s.evolution && (
              <div className="bg-surface-container-lowest rounded-lg p-3">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Évolution / Note</p>
                <p className="text-sm">{s.evolution}</p>
              </div>
            )}
          </CarteBase>
        ))}
      </div>
    )
  }

  const renderCompteRendu = () => {
    const items = dossier?.protocolesOperatoires || []
    if (!items.length) return <Vide texte="Aucun compte-rendu opératoire enregistré." />
    return (
      <div className="space-y-3">
        {items.map((p: any, i: number) => (
          <CarteBase key={p.id || i} enTete={
            <div className="flex items-start justify-between">
              <p className="text-sm font-bold text-on-surface">{formaterDate(p.dateOperation)}</p>
              {p.chirurgien && <Badge tone="blue">{p.chirurgien.prenom} {p.chirurgien.nom}</Badge>}
            </div>
          }>
            <p className="text-sm whitespace-pre-line">{p.compteRenduIntervention || 'Compte-rendu non renseigné.'}</p>
          </CarteBase>
        ))}
      </div>
    )
  }

  const renderParaclinique = () => {
    const items = dossier?.examensComplementaires || []
    if (!items.length) return <Vide texte="Aucun résultat paraclinique enregistré." />
    return (
      <div className="space-y-3">
        {items.map((e: any, i: number) => (
          <CarteBase key={e.id || i} enTete={
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">{e.titre || e.examinationType}</p>
                <p className="text-xs text-on-surface-variant">{formaterDate(e.dateExamen)} {e.laboratoire ? `· ${e.laboratoire}` : ''}</p>
              </div>
              <div className="flex gap-1">
                {e.isUrgent && <Badge tone="red">Urgent</Badge>}
                <Badge tone="gray">{e.examinationType}</Badge>
              </div>
            </div>
          }>
            {e.resultats && <p className="text-sm"><span className="font-bold text-on-surface-variant">Résultats : </span>{e.resultats}</p>}
            {e.interpretation && <p className="text-sm"><span className="font-bold text-on-surface-variant">Interprétation : </span>{e.interpretation}</p>}
            {e.conclusion && <p className="text-sm"><span className="font-bold text-on-surface-variant">Conclusion : </span>{e.conclusion}</p>}
          </CarteBase>
        ))}
      </div>
    )
  }

  const renderSortie = () => {
    const items = dossier?.sortie || []
    if (!items.length) return <Vide texte="Aucune sortie médicale enregistrée pour ce séjour." />
    return (
      <div className="space-y-3">
        {items.map((s: any, i: number) => (
          <CarteBase key={s.id || i} enTete={
            <div className="flex items-start justify-between">
              <p className="text-sm font-bold text-on-surface">{s.etatSortie || 'Sortie'}</p>
              <Badge tone={s.modeSortie === 'DECES' ? 'red' : s.modeSortie === 'SORTIE_AUTORISEE' ? 'green' : 'amber'}>{s.modeSortie?.replace(/_/g, ' ')}</Badge>
            </div>
          }>
            {s.motifSortie && <p className="text-sm"><span className="font-bold text-on-surface-variant">Motif : </span>{s.motifSortie}</p>}
            {s.diagnosticFinal && <p className="text-sm"><span className="font-bold text-on-surface-variant">Diagnostic final : </span>{s.diagnosticFinal}</p>}
            {s.traitementSortie && <p className="text-sm"><span className="font-bold text-on-surface-variant">Traitement de sortie : </span>{s.traitementSortie}</p>}
            {s.conduiteATenir && <p className="text-sm"><span className="font-bold text-on-surface-variant">Conduite à tenir : </span>{s.conduiteATenir}</p>}
            {s.rendezVousControle && <p className="text-sm"><span className="font-bold text-on-surface-variant">RDV de contrôle : </span>{s.rendezVousControle}</p>}
          </CarteBase>
        ))}
      </div>
    )
  }

  const renderHistorique = () => {
    const antecedents = dossier?.antecedents || []
    const histoires = dossier?.histoiresMaladie || []
    const examens = dossier?.examensPhysiques || []
    if (!antecedents.length && !histoires.length && !examens.length) return <Vide texte="Aucun historique renseigné." />
    return (
      <div className="space-y-6">
        {antecedents.length > 0 && (
          <div>
            <h4 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wide mb-2">Antécédents</h4>
            <div className="space-y-2">
              {antecedents.map((a: any, i: number) => (
                <CarteBase key={a.id || i} enTete={
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-bold text-on-surface">{a.title || a.category}</p>
                    {a.isActive === false && <Badge tone="gray">Inactif</Badge>}
                  </div>
                }>
                  {a.description && <p className="text-sm">{a.description}</p>}
                  {a.allergySeverity && <Badge tone="red">Allergie {a.allergySeverity}</Badge>}
                </CarteBase>
              ))}
            </div>
          </div>
        )}
        {histoires.length > 0 && (
          <div>
            <h4 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wide mb-2">Histoire de la maladie</h4>
            <div className="space-y-2">
              {histoires.map((h: any, i: number) => (
                <CarteBase key={h.id || i} enTete={
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-bold text-on-surface">{formaterDate(h.createdAt, true)}</p>
                    {h.isEmergency && <Badge tone="red">Urgence</Badge>}
                  </div>
                }>
                  {h.chronologicalNarrative && <p className="text-sm">{h.chronologicalNarrative}</p>}
                </CarteBase>
              ))}
            </div>
          </div>
        )}
        {examens.length > 0 && (
          <div>
            <h4 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wide mb-2">Derniers examens physiques</h4>
            <div className="space-y-2">
              {examens.map((e: any, i: number) => (
                <CarteBase key={e.id || i} enTete={<p className="text-sm font-bold text-on-surface">{e.category?.replace(/_/g, ' ')}</p>}>
                  {e.notes && <p className="text-sm">{e.notes}</p>}
                </CarteBase>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderPrescription = () => {
    const toutes = dossier?.prescriptions || []
    const items = filtrePrescription === 'all' ? toutes : toutes.filter((p: any) => p._type === filtrePrescription)
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFiltrePrescription('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${filtrePrescription === 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-low'}`}>
            Tout ({toutes.length})
          </button>
          {PRESCRIPTION_TYPES.map((t) => {
            const n = toutes.filter((p: any) => p._type === t.id).length
            if (!n) return null
            const actif = filtrePrescription === t.id
            return (
              <button key={t.id} onClick={() => setFiltrePrescription(t.id)}
                className="px-3 py-1 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1"
                style={actif ? { background: t.couleur, borderColor: t.couleur, color: '#fff' } : { background: '#fff', borderColor: `${t.couleur}40`, color: t.couleur }}>
                <span className="material-symbols-outlined text-xs">{t.icone}</span>{t.label} ({n})
              </button>
            )
          })}
        </div>

        {items.length === 0 ? <Vide texte="Aucune prescription trouvée." /> : (
          <div className="space-y-2">
            {items.map((item: any, i: number) => {
              const meta = prescriptionMeta(item._type)
              const couleur = meta?.couleur || '#1e3a5f'
              return (
                <button key={item.id || i} onClick={() => setPrescriptionSelectionnee(item)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl border border-outline-variant/20 bg-white shadow-sm hover:shadow-md transition-shadow text-left"
                  style={{ borderLeftWidth: 4, borderLeftColor: couleur }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${couleur}20` }}>
                    <span className="material-symbols-outlined text-lg" style={{ color: couleur }}>{meta?.icone || 'description'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full" style={{ background: `${couleur}20`, color: couleur }}>{meta?.label || item._type}</span>
                      <span className="text-[11px] text-on-surface-variant">{formaterDate(item.createdAt || item.date, true)}</span>
                    </div>
                    <p className="text-sm font-bold text-on-surface mt-1 truncate">{resumePrescription(item, item._type)}</p>
                    {(item.remarque || item.remarques || item.instructions) && (
                      <p className="text-xs text-on-surface-variant mt-0.5 truncate">{item.remarque || item.remarques || item.instructions}</p>
                    )}
                  </div>
                  {item.statut && (
                    <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full shrink-0 ${STATUTS_OK.has(item.statut) ? 'bg-emerald-100 text-emerald-700' : STATUTS_KO.has(item.statut) ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.statut}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {prescriptionSelectionnee && (
          <PrescriptionDetailModal item={prescriptionSelectionnee} onClose={() => setPrescriptionSelectionnee(null)} />
        )}
      </div>
    )
  }

  const renderContenu = () => {
    if (loading) return <p className="text-sm text-on-surface-variant py-6 text-center">Chargement du dossier...</p>
    if (erreur) return <p className="text-sm text-on-surface-variant italic py-6 text-center">Dossier patient indisponible pour le moment.</p>
    switch (onglet) {
      case 'observation': return renderObservation()
      case 'diagnostic': return renderDiagnostic()
      case 'suivi': return renderSuivi()
      case 'prescription': return renderPrescription()
      case 'compteRendu': return renderCompteRendu()
      case 'paraclinique': return renderParaclinique()
      case 'sortie': return renderSortie()
      case 'historique': return renderHistorique()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="flex overflow-x-auto border-b border-outline-variant/20 bg-surface-container-lowest">
        {ONGLETS.map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
              onglet === o.id ? 'border-primary text-primary bg-white' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-white/50'
            }`}>
            <span className="material-symbols-outlined text-base">{o.icone}</span>
            {o.label}
          </button>
        ))}
      </div>
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {renderContenu()}
      </div>
    </div>
  )
}
