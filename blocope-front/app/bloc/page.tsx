'use client'

import { useState, useEffect } from 'react'
import { rapportsService, notificationService, patientService } from '@/lib/api'
import WelcomeBanner from '@/components/bloc/dashboard/WelcomeBanner'
import EtatGlobalPatients from '@/components/bloc/dashboard/EtatGlobalPatients'
import AlerteBandeau from '@/components/bloc/dashboard/AlerteBandeau'
import GroupePlanningTable, { LignePlanning } from '@/components/bloc/dashboard/GroupePlanningTable'
import { obtenirSessionValide } from '@/lib/auth/central-session'
import { formaterNomPatient } from '@/lib/patient'

// Jamais l'ID en remplacement du nom (interdit) — voir formaterNomPatient.
const nomPatient = (p: any) => {
  const nom = (p?.nom || '').trim()
  if (!nom) return 'Patient inconnu'
  const prenom = (p?.prenom || '').trim()
  return `${nom.toUpperCase()}${prenom ? `, ${prenom}` : ''}`
}
const priorite = (niveau?: string): LignePlanning['priorite'] => niveau === 'STAT' ? 'STAT' : niveau === 'URGENT' ? 'URGENT' : 'NORMAL'
const estAujourdhui = (date?: string | Date | null) => {
  if (!date) return false
  return new Date(date).toDateString() === new Date().toDateString()
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({ totalPatients: 0, urgencesParNiveau: [] })
  const [prescriptions, setPrescriptions] = useState<LignePlanning[]>([])
  const [patientsCpa, setPatientsCpa] = useState<LignePlanning[]>([])
  const [patientsBloc, setPatientsBloc] = useState<LignePlanning[]>([])
  const [patientsReveil, setPatientsReveil] = useState<LignePlanning[]>([])
  const session = obtenirSessionValide()

  useEffect(() => { chargerToutesLesDonnees() }, [])

  const chargerToutesLesDonnees = async () => {
    setLoading(true)

    const [statsRes, notifsRes, cpaRes, pretRes, encoursRes, reveilRes] = await Promise.allSettled([
      rapportsService.getStatistiques(),
      notificationService.getAll(1, 100),
      patientService.getAll({ statut: 'EN_ATTENTE_CPA', limite: 50 }),
      patientService.getAll({ statut: 'PRET_POUR_BLOC', limite: 50 }),
      patientService.getAll({ statut: 'EN_COURS_OPERATION', limite: 50 }),
      patientService.getAll({ statut: 'EN_SALLE_REVEIL', limite: 50 }),
    ])

    if (statsRes.status === 'fulfilled') setStats(statsRes.value)

    if (notifsRes.status === 'fulfilled') {
      const enAttente = (notifsRes.value?.data || []).filter((n: any) => n.statut === 'EN_ATTENTE' && estAujourdhui(n.createdAt))
      setPrescriptions(enAttente.map((n: any): LignePlanning => {
        const patientId = n.patient?.id || n.patientId
        return {
          priorite: n.estUrgent ? 'URGENT' : priorite(n.patient?.niveauUrgence),
          nom: n.patientNom || nomPatient(n.patient),
          idDossier: n.patient?.idDossier || '—',
          intervention: n.intervention || n.motif || '',
          responsable: n.chirurgienNom || n.chirurgien?.nom || n.prescripteur || '',
          heure: n.heurePrescription,
          actionLabel: 'Traiter',
          href: patientId ? `/bloc/dossier-patient/${patientId}?notifId=${n.id || ''}` : '/bloc/notification-cpa',
        }
      }))
    }

    const versLignePatient = (statut: string, actionLabel: string, cible: string) => (p: any): LignePlanning => {
      const nom = encodeURIComponent(nomPatient(p))
      const intervention = encodeURIComponent(p.libelle || '')
      return {
        priorite: priorite(p.niveauUrgence),
        nom: nomPatient(p),
        idDossier: p.idDossier || '—',
        intervention: p.libelle || p.typeChirurgie || '',
        responsable: p.chirurgien_nom || '',
        heure: p.dateIntervention ? new Date(p.dateIntervention).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : undefined,
        actionLabel,
        href: `${cible}?patientId=${p.patientId}&patientNom=${nom}&intervention=${intervention}`,
      }
    }

    // Patients apte au circuit CPA et en attente de la consultation elle-même — pas de filtre
    // "aujourd'hui" ici, la date d'intervention (souvent à quelques jours) n'a pas de lien avec
    // la date à laquelle la CPA doit être réalisée.
    if (cpaRes.status === 'fulfilled') {
      const liste = cpaRes.value?.data || []
      setPatientsCpa(liste.map(versLignePatient('EN_ATTENTE_CPA', 'Traiter', '/bloc/consultation-cpa')))
    }

    // Prévu aujourd'hui, ou sans date programmée (à planifier en priorité)
    const duJour = (p: any) => !p.dateIntervention || estAujourdhui(p.dateIntervention)

    const pret = (pretRes.status === 'fulfilled' ? (pretRes.value?.data || []) : []).filter(duJour)
    const encours = (encoursRes.status === 'fulfilled' ? (encoursRes.value?.data || []) : []).filter(duJour)
    setPatientsBloc([
      ...pret.map(versLignePatient('PRET_POUR_BLOC', 'Check-list', '/bloc/checklist-oms')),
      ...encours.map(versLignePatient('EN_COURS_OPERATION', 'Suivi', '/bloc/activite-pendant-operation')),
    ])

    if (reveilRes.status === 'fulfilled') {
      // Toujours "aujourd'hui" par nature : un patient reste peu de temps en salle de réveil
      const liste = reveilRes.value?.data || []
      setPatientsReveil(liste.map(versLignePatient('EN_SALLE_REVEIL', 'Suivi réveil', '/bloc/salle-de-reveil/suivi')).map((l: LignePlanning) => ({
        ...l,
        // Point d'entrée indépendant pour le chirurgien : il ne suit pas le même
        // enchaînement d'écrans que l'anesthésiste, il doit pouvoir retrouver le
        // patient ici pour remplir le protocole opératoire.
        actionLabel2: 'Protocole opératoire',
        href2: l.href.replace('/bloc/salle-de-reveil/suivi', '/bloc/protocole-operatoire'),
      })))
    }

    setLoading(false)
  }

  const urgencesParNiveau: { niveauurgence?: string; niveauUrgence?: string; count: string }[] = stats.urgencesParNiveau || []
  const compte = (niveau: string) => Number(urgencesParNiveau.find(u => (u.niveauUrgence || u.niveauurgence) === niveau)?.count || 0)
  const statCount = compte('STAT')
  const urgentCount = compte('URGENT')
  const normalCount = compte('NORMAL')
  const total = stats.totalPatientsActifs ?? (statCount + urgentCount + normalCount)

  return (
    <div className="p-8 space-y-6">
      <WelcomeBanner
        nom={session ? `${session.payload.firstname} ${session.payload.name}` : ''}
        role={session?.acces.roleName || null}
      />

      {!loading && <AlerteBandeau count={statCount} message={`${statCount} patient${statCount > 1 ? 's' : ''} TRÈS URGENT en attente de prise en charge`} href="/bloc/patient-du-jour" />}

      <EtatGlobalPatients total={total} stat={statCount} urgent={urgentCount} normal={normalCount} />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-on-surface">Planning du jour</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <GroupePlanningTable
            icon="notification_important"
            titre="Fil de prescription — Aujourd'hui"
            accent="tertiary"
            lignes={prescriptions}
            loading={loading}
            emptyMessage="Aucune prescription reçue aujourd'hui"
          />
          <GroupePlanningTable
            icon="fact_check"
            titre="Patients prêts pour la CPA"
            accent="quaternary"
            lignes={patientsCpa}
            loading={loading}
            emptyMessage="Aucun patient en attente de consultation pré-anesthésique"
          />
          <GroupePlanningTable
            icon="medical_services"
            titre="Bloc Opératoire — Aujourd'hui"
            accent="primary"
            lignes={patientsBloc}
            loading={loading}
            emptyMessage="Aucun patient prêt ou en cours d'intervention aujourd'hui"
          />
          <GroupePlanningTable
            icon="bed"
            titre="Salle de Réveil"
            accent="secondary"
            lignes={patientsReveil}
            loading={loading}
            emptyMessage="Personne en salle de réveil actuellement"
          />
        </div>
      </div>
    </div>
  )
}
