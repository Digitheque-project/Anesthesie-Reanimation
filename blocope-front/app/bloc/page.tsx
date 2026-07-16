'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { rapportsService } from '@/lib/api'
import WelcomeBanner from '@/components/bloc/dashboard/WelcomeBanner'
import StatsGrid from '@/components/bloc/dashboard/StatsGrid'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>({ totalPatients: 0, totalOperations: 0, totalUrgences: 0, totalMedecins: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { chargerStats() }, [])

  const chargerStats = async () => {
    try {
      const data = await rapportsService.getStatistiques()
      setStats(data)
    } catch (err) {
      console.error('Erreur stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <WelcomeBanner nom="Dr Sarah RASOANIRINA" role="CHIRURGIEN" />
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <button onClick={() => router.push('/bloc/notification-cpa')}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-left border border-outline-variant/30">
          <h3 className="font-bold text-primary">📋 Notifications CPA</h3>
          <p className="text-xs text-on-surface-variant mt-2">Gérer les prescriptions et RDV CPA</p>
        </button>
        <button onClick={() => router.push('/bloc/rendez-vous')}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-left border border-outline-variant/30">
          <h3 className="font-bold text-primary">📅 Rendez-vous</h3>
          <p className="text-xs text-on-surface-variant mt-2">Planning des CPA et VPA</p>
        </button>
        <button onClick={() => router.push('/bloc/patient-du-jour')}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-left border border-outline-variant/30">
          <h3 className="font-bold text-primary">👤 Patients du jour</h3>
          <p className="text-xs text-on-surface-variant mt-2">Liste des patients à opérer</p>
        </button>
        <button onClick={() => router.push('/bloc/salle-de-reveil')}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-left border border-outline-variant/30">
          <h3 className="font-bold text-primary">🛏️ Salle de réveil</h3>
          <p className="text-xs text-on-surface-variant mt-2">Suivi des patients en réveil</p>
        </button>
        {/* Checklist avant opérations, Rapports et Archives ont été supprimés */}
      </div>
    </div>
  )
}
