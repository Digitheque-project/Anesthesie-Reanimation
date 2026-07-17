'use client'

import { useState, useEffect } from 'react'
import HeaderNotification from '@/components/bloc/notification-cpa/HeaderNotification'
import StatsNotification from '@/components/bloc/notification-cpa/StatsNotification'
import TableauNotifications from '@/components/bloc/notification-cpa/TableauNotifications'
import ModalPlanifierRDV from '@/components/bloc/notification-cpa/ModalPlanifierRDV'
import { useRouter } from 'next/navigation'
import { notificationService, planningService } from '@/lib/api'
import { obtenirSessionValide } from '@/lib/auth/central-session'

export default function NotificationCPAPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showFiltres, setShowFiltres] = useState(false)
  // Le fil de prescription ne doit montrer que les prescriptions pas encore traitées : une fois
  // le RDV CPA planifié, le patient bascule vers la liste "Rendez-vous CPA" et ne doit plus
  // réapparaître ici par défaut (les autres filtres restent disponibles pour l'historique).
  const [filtreActif, setFiltreActif] = useState('EN_ATTENTE')
  const [showModal, setShowModal] = useState(false)
  const [selectedNotif, setSelectedNotif] = useState<any>(null)
  const [stats, setStats] = useState({ enAttente: 0, prioriteHaute: 0, rdvFixes24h: 0 })

  useEffect(() => { charger() }, [])

  const charger = async () => {
    try {
      setLoading(true)
      const data = await notificationService.getAll(1, 100)
      const notifs = data.data || []
      setNotifications(notifs)
      setStats({
        enAttente: notifs.filter((n: any) => n.statut === 'EN_ATTENTE').length,
        prioriteHaute: notifs.filter((n: any) => n.estUrgent).length,
        rdvFixes24h: notifs.filter((n: any) => n.statut === 'RDV_PLANIFIE').length,
      })
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handlePlanifier = (notif: any) => {
    setSelectedNotif(notif)
    setShowModal(true)
  }

  // 🟢 FONCTION AJOUTÉE : Valider la planification
  const handleValiderPlanification = async (formData: any) => {
    try {
      if (!selectedNotif) return
      
      const patientId = selectedNotif.patientId || selectedNotif.patient?.id
      if (!patientId) {
        alert('❌ ID patient manquant')
        return
      }

      // Calculer l'heure de fin (30 min plus tard)
      const [h, m] = (formData.heureRDV || '09:00').split(':').map(Number)
      const fin = new Date()
      fin.setHours(h, m + 30)
      const heureFin = fin.toTimeString().split(' ')[0].substring(0, 5)

      const session = obtenirSessionValide()
      const responsable = session ? `${session.payload.firstname} ${session.payload.name}`.trim() : undefined

      await planningService.reserverCreneau({
        patientId: patientId,
        date: formData.dateRDV || new Date().toISOString().split('T')[0],
        heureDebut: formData.heureRDV || '09:00',
        heureFin: heureFin,
        salle: formData.lieuRDV || 'Salle CPA',
        estUrgence: selectedNotif.estUrgent || false,
        type: formData.typeRDV || 'CPA',
        responsable,
      })

      // Bascule la notification en RDV_PLANIFIE et notifie automatiquement le service d'origine
      if (selectedNotif.id) {
        await notificationService.planifierRDV(selectedNotif.id)
      }

      alert('✅ Rendez-vous CPA planifié avec succès !')
      setShowModal(false)
      setSelectedNotif(null)
      charger()
    } catch (err: any) {
      console.error(err)
      alert('❌ Erreur : ' + (err.response?.data?.message || err.message || 'Erreur inconnue'))
    }
  }

  // 🟢 FONCTION MODIFIÉE : Vérifier si patient STAT
  const estPatientStat = (notif: any) => Boolean(notif.estUrgent || notif.urgence === 3)

  // 🟢 FONCTION MODIFIÉE : Action selon type
  const handleActionPrescription = (notif: any) => {
    if (!estPatientStat(notif)) {
      handlePlanifier(notif)
      return
    }

    const patientId = notif.patientId || notif.patient?.id
    const patientNom = notif.patientNom || notif.patient?.nom || 'Patient'
    const intervention = notif.intervention || notif.motif || ''

    router.push(
      `/bloc/visite-pre-anesthesique?patientId=${patientId}&patientNom=${encodeURIComponent(patientNom)}&intervention=${encodeURIComponent(intervention)}&statut=STAT`
    )
  }

  const notificationsFiltrees = filtreActif === 'tous' ? notifications
    : filtreActif === 'urgent' ? notifications.filter(n => n.estUrgent)
    : notifications.filter(n => n.statut === filtreActif)

  return (
    <div className="p-8 flex flex-col gap-6">
      <HeaderNotification onActualiser={charger} onToggleFiltres={() => setShowFiltres(!showFiltres)} />

      {showFiltres && (
        <div className="bg-white border rounded-xl shadow-lg p-4 w-64 space-y-2">
          {['tous','urgent','EN_ATTENTE','RDV_PLANIFIE','REALISE'].map(f => (
            <button key={f} onClick={() => { setFiltreActif(f); setShowFiltres(false) }}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${filtreActif===f ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
              {f==='tous'?'Tous':f==='urgent'?'Priorité':f==='EN_ATTENTE'?'En attente':f==='RDV_PLANIFIE'?'RDV Planifiés':'Réalisés'}
            </button>
          ))}
        </div>
      )}

      <StatsNotification stats={stats} />

      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement des notifications...</div>
      ) : (
        <TableauNotifications
          notifications={notificationsFiltrees}
          onPlanifier={handlePlanifier}
          onActionUrgent={handleActionPrescription}
          onVoirDossier={(n: any) => {
            const id = (n.patient as any)?.id || n.patientId
            if (id) router.push(`/bloc/dossier-patient/${id}?notifId=${n.id || ''}`)
          }}
        />
      )}

      {selectedNotif && (
        <ModalPlanifierRDV
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onValider={handleValiderPlanification}
          patientNom={selectedNotif.patient?.nom || 'Patient'}
          intervention={selectedNotif.intervention}
          estUrgent={selectedNotif.estUrgent}
        />
      )}
    </div>
  )
}
