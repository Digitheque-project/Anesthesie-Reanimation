'use client'

import { useState, useEffect } from 'react'
import { rapportsService, notificationService, patientService } from '@/lib/api'
import WelcomeBanner from '@/components/bloc/dashboard/WelcomeBanner'
import EtatGlobalPatients from '@/components/bloc/dashboard/EtatGlobalPatients'
import AlerteBandeau from '@/components/bloc/dashboard/AlerteBandeau'
import GroupePlanningTable, { LignePlanning } from '@/components/bloc/dashboard/GroupePlanningTable'
import RaccourcisBloc from '@/components/bloc/dashboard/RaccourcisBloc'

const nomPatient = (p: any) => `${(p?.nom || '').toUpperCase()}${p?.nom && p?.prenom ? ', ' : ''}${p?.prenom || ''}`.trim() || p?.patientId || p?.id || 'Patient'
const priorite = (niveau?: string): LignePlanning['priorite'] => niveau === 'STAT' ? 'STAT' : niveau === 'URGENT' ? 'URGENT' : 'NORMAL'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({ totalPatients: 0, urgencesParNiveau: [] })
  const [prescriptions, setPrescriptions] = useState<LignePlanning[]>([])
  const [patientsBloc, setPatientsBloc] = useState<LignePlanning[]>([])
  const [patientsReveil, setPatientsReveil] = useState<LignePlanning[]>([])

  useEffect(() => { chargerToutesLesDonnees() }, [])

  const chargerToutesLesDonnees = async () => {
    setLoading(true)

    const [statsRes, notifsRes, pretRes, encoursRes, reveilRes] = await Promise.allSettled([
      rapportsService.getStatistiques(),
      notificationService.getAll(1, 100),
      patientService.getAll({ statut: 'PRET_POUR_BLOC', limite: 50 }),
      patientService.getAll({ statut: 'EN_COURS_OPERATION', limite: 50 }),
      patientService.getAll({ statut: 'EN_SALLE_REVEIL', limite: 50 }),
    ])

    if (statsRes.status === 'fulfilled') setStats(statsRes.value)

    if (notifsRes.status === 'fulfilled') {
      const enAttente = (notifsRes.value?.data || []).filter((n: any) => n.statut === 'EN_ATTENTE')
      setPrescriptions(enAttente.map((n: any): LignePlanning => {
        const patientId = n.patient?.id || n.patientId
        return {
          priorite: n.estUrgent ? 'URGENT' : priorite(n.patient?.niveauUrgence),
          nom: n.patient?.nom ? nomPatient(n.patient) : (n.patientNom || patientId || 'Patient'),
          idDossier: n.patient?.idDossier || patientId || '—',
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
        idDossier: p.idDossier || p.patientId,
        intervention: p.libelle || p.typeChirurgie || '',
        responsable: p.chirurgien_nom || '',
        heure: p.dateIntervention ? new Date(p.dateIntervention).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : undefined,
        actionLabel,
        href: `${cible}?patientId=${p.patientId}&patientNom=${nom}&intervention=${intervention}`,
      }
    }

    const pret = pretRes.status === 'fulfilled' ? (pretRes.value?.data || []) : []
    const encours = encoursRes.status === 'fulfilled' ? (encoursRes.value?.data || []) : []
    setPatientsBloc([
      ...pret.map(versLignePatient('PRET_POUR_BLOC', 'Check-list', '/bloc/checklist-oms')),
      ...encours.map(versLignePatient('EN_COURS_OPERATION', 'Suivi', '/bloc/activite-pendant-operation')),
    ])

    if (reveilRes.status === 'fulfilled') {
      const liste = reveilRes.value?.data || []
      setPatientsReveil(liste.map(versLignePatient('EN_SALLE_REVEIL', 'Suivi réveil', '/bloc/salle-de-reveil/suivi')))
    }

    setLoading(false)
  }

  const urgencesParNiveau: { niveauurgence?: string; niveauUrgence?: string; count: string }[] = stats.urgencesParNiveau || []
  const compte = (niveau: string) => Number(urgencesParNiveau.find(u => (u.niveauUrgence || u.niveauurgence) === niveau)?.count || 0)
  const statCount = compte('STAT')
  const urgentCount = compte('URGENT')
  const normalCount = compte('NORMAL')
  const total = stats.totalPatients || (statCount + urgentCount + normalCount)

  return (
    <div className="p-8 space-y-6">
      <WelcomeBanner nom="Dr Sarah RASOANIRINA" role="CHIRURGIEN" patientsDuJour={total} />

      {!loading && <AlerteBandeau count={statCount} message={`${statCount} patient${statCount > 1 ? 's' : ''} STAT en attente de prise en charge`} href="/bloc/patient-du-jour" />}

      <EtatGlobalPatients total={total} stat={statCount} urgent={urgentCount} normal={normalCount} />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-on-surface">Planning par Destination</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <GroupePlanningTable
            icon="notification_important"
            titre="Fil de prescription"
            accent="tertiary"
            lignes={prescriptions}
            loading={loading}
            emptyMessage="Aucune prescription en attente de décision"
          />
          <GroupePlanningTable
            icon="surgical_sterilization"
            titre="Bloc Opératoire"
            accent="primary"
            lignes={patientsBloc}
            loading={loading}
            emptyMessage="Aucun patient prêt ou en cours d'intervention"
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

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface">Raccourcis</h3>
        <RaccourcisBloc />
      </div>
    </div>
  )
}
