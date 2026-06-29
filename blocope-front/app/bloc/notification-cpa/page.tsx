
'use client'

import { useState, useEffect } from 'react'
import HeaderNotification from '@/components/bloc/notification-cpa/HeaderNotification'
import StatsNotification from '@/components/bloc/notification-cpa/StatsNotification'
import TableauNotifications from '@/components/bloc/notification-cpa/TableauNotifications'
import ModalPlanifierRDV from '@/components/bloc/notification-cpa/ModalPlanifierRDV'
import { useRouter } from 'next/navigation'
import { notificationService, planningService } from '@/lib/api'

export default function NotificationCPAPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showFiltres, setShowFiltres] = useState(false)
  const [filtreActif, setFiltreActif] = useState('tous')
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

  const handleValiderPlanification = async (formData: any) => {
    try {
      const [h, m] = formData.heureRDV.split(':').map(Number)
      const fin = new Date()
      fin.setHours(h, m + 30)
      const heureFin = fin.toTimeString().split(' ')[0].substring(0, 5)

      await planningService.reserverCreneau({
        patientId: selectedNotif.patient?.id || selectedNotif.patientId,
        chirurgienId: selectedNotif.chirurgien?.id || selectedNotif.chirurgienId,
        date: formData.dateRDV,
        heureDebut: formData.heureRDV,
        heureFin: heureFin,
        salle: formData.lieuRDV || 'Salle CPA',
        estUrgence: selectedNotif.estUrgent || false,
        type: formData.typeRDV || 'CPA',
      })

      alert('✅ Rendez-vous planifié avec succès ! Le patient apparaîtra dans la liste des Rendez-vous.')
      setShowModal(false)
      charger()
    } catch (err: any) {
      console.error(err)
      alert('❌ Erreur : ' + (err.response?.data?.message || err.message))
    }
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
          onVoirDossier={(n: any) => { const id = (n.patient as any)?.id || n.patient; if (id) router.push("/bloc/dossier-patient/" + id) }}
        />
      )}

      {selectedNotif && (
        <ModalPlanifierRDV
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onValider={handleValiderPlanification}
          patientNom={selectedNotif.patient?.nom || 'Patient'}
          intervention={selectedNotif.intervention}
          professeurCPA={selectedNotif.professeurCPA}
          estUrgent={selectedNotif.estUrgent}
        />
      )}
    </div>
  )
}


