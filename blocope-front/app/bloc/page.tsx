'use client'

import { useState, useEffect } from 'react'
import { rapportsService, notificationService, planningService, patientService } from '@/lib/api'
import WelcomeBanner from '@/components/bloc/dashboard/WelcomeBanner'
import StatsGrid from '@/components/bloc/dashboard/StatsGrid'
import TacheCard, { TacheItem } from '@/components/bloc/dashboard/TacheCard'

const nomPatient = (p: any) => `${p?.nom || ''} ${p?.prenom || ''}`.trim() || p?.patientId || p?.id || 'Patient'
const estUrgent = (niveau?: string) => niveau === 'STAT' || niveau === 'URGENT'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({ totalPatients: 0, totalOperations: 0, totalUrgences: 0, totalMedecins: 0 })
  const [loading, setLoading] = useState(true)

  const [prescriptions, setPrescriptions] = useState<TacheItem[]>([])
  const [rdvAujourdhui, setRdvAujourdhui] = useState<TacheItem[]>([])
  const [patientsBloc, setPatientsBloc] = useState<TacheItem[]>([])
  const [patientsReveil, setPatientsReveil] = useState<TacheItem[]>([])

  useEffect(() => { chargerToutesLesDonnees() }, [])

  const chargerToutesLesDonnees = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    const [statsRes, notifsRes, rdvCpaRes, rdvVpaRes, blocRes, reveilRes] = await Promise.allSettled([
      rapportsService.getStatistiques(),
      notificationService.getAll(1, 100),
      planningService.getJour(today, 'CPA'),
      planningService.getJour(today, 'VPA'),
      patientService.getAll({ statut: 'PRET_POUR_BLOC', limite: 50 }),
      patientService.getAll({ statut: 'EN_SALLE_REVEIL', limite: 50 }),
    ])

    if (statsRes.status === 'fulfilled') setStats(statsRes.value)

    if (notifsRes.status === 'fulfilled') {
      const enAttente = (notifsRes.value?.data || []).filter((n: any) => n.statut === 'EN_ATTENTE')
      setPrescriptions(enAttente.map((n: any) => {
        const patientId = n.patient?.id || n.patientId
        return {
          label: n.patient?.nom ? nomPatient(n.patient) : (n.patientNom || patientId),
          sublabel: n.intervention || n.motif || '',
          urgent: Boolean(n.estUrgent),
          href: patientId ? `/bloc/dossier-patient/${patientId}?notifId=${n.id || ''}` : undefined,
        }
      }))
    }

    const cpa = rdvCpaRes.status === 'fulfilled' ? rdvCpaRes.value : []
    const vpa = rdvVpaRes.status === 'fulfilled' ? rdvVpaRes.value : []
    const rdv = [...(Array.isArray(cpa) ? cpa : []), ...(Array.isArray(vpa) ? vpa : [])]
      .sort((a: any, b: any) => (a.heureDebut || '').localeCompare(b.heureDebut || ''))
    setRdvAujourdhui(rdv.map((c: any) => {
      const patientId = c.patient?.id || c.patientId
      const nom = encodeURIComponent(nomPatient(c.patient))
      const cible = c.type === 'VPA' ? '/bloc/visite-pre-anesthesique' : '/bloc/consultation-cpa'
      return {
        label: nomPatient(c.patient),
        sublabel: `${c.heureDebut || ''} · ${c.type || ''}`,
        urgent: c.estUrgence,
        href: patientId ? `${cible}?patientId=${patientId}&patientNom=${nom}` : undefined,
      }
    }))

    if (blocRes.status === 'fulfilled') {
      const liste = blocRes.value?.data || []
      setPatientsBloc(liste.map((p: any) => {
        const nom = encodeURIComponent(nomPatient(p))
        const intervention = encodeURIComponent(p.libelle || '')
        return {
          label: nomPatient(p),
          sublabel: p.libelle || p.typeChirurgie || '',
          urgent: estUrgent(p.niveauUrgence),
          href: `/bloc/checklist-oms?patientId=${p.patientId}&patientNom=${nom}&intervention=${intervention}`,
        }
      }))
    }

    if (reveilRes.status === 'fulfilled') {
      const liste = reveilRes.value?.data || []
      setPatientsReveil(liste.map((p: any) => {
        const nom = encodeURIComponent(nomPatient(p))
        const intervention = encodeURIComponent(p.libelle || '')
        return {
          label: nomPatient(p),
          sublabel: p.chambre || '',
          urgent: estUrgent(p.niveauUrgence),
          href: `/bloc/salle-de-reveil/suivi?patientId=${p.patientId}&patientNom=${nom}&intervention=${intervention}`,
        }
      }))
    }

    setLoading(false)
  }

  const urgencesTotal = [...prescriptions, ...rdvAujourdhui, ...patientsBloc, ...patientsReveil].filter(i => i.urgent).length

  return (
    <div className="p-8 flex flex-col gap-6">
      <WelcomeBanner nom="Dr Sarah RASOANIRINA" role="CHIRURGIEN" />

      {!loading && urgencesTotal > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-600 animate-pulse">emergency</span>
          <p className="text-sm font-bold text-red-700">
            {urgencesTotal} élément{urgencesTotal > 1 ? 's' : ''} urgent{urgencesTotal > 1 ? 's' : ''} nécessite{urgencesTotal > 1 ? 'nt' : ''} votre attention aujourd'hui
          </p>
        </div>
      )}

      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-on-surface-variant mb-3">Ce qui vous attend aujourd'hui</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <TacheCard
            icon="notification_important"
            titre="Fil de prescription"
            count={prescriptions.length}
            accent="error"
            items={prescriptions}
            ctaLabel="Traiter les prescriptions"
            ctaHref="/bloc/notification-cpa"
            emptyMessage="Aucune prescription en attente"
            loading={loading}
          />
          <TacheCard
            icon="calendar_today"
            titre="Rendez-vous aujourd'hui"
            count={rdvAujourdhui.length}
            accent="primary"
            items={rdvAujourdhui}
            ctaLabel="Voir le planning"
            ctaHref="/bloc/rendez-vous"
            emptyMessage="Aucun rendez-vous prévu aujourd'hui"
            loading={loading}
          />
          <TacheCard
            icon="person"
            titre="Patients prêts pour le bloc"
            count={patientsBloc.length}
            accent="secondary"
            items={patientsBloc}
            ctaLabel="Voir les patients du jour"
            ctaHref="/bloc/patient-du-jour"
            emptyMessage="Aucun patient prêt pour le moment"
            loading={loading}
          />
          <TacheCard
            icon="bed"
            titre="En salle de réveil"
            count={patientsReveil.length}
            accent="tertiary"
            items={patientsReveil}
            ctaLabel="Voir la salle de réveil"
            ctaHref="/bloc/salle-de-reveil"
            emptyMessage="Personne en salle de réveil actuellement"
            loading={loading}
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-on-surface-variant mb-3">Vue d'ensemble</h2>
        <StatsGrid stats={stats} />
      </div>
    </div>
  )
}
