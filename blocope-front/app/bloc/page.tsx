'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { rapportsService, authService } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>({ totalPatients: 0, totalOperations: 0, totalUrgences: 0, totalMedecins: 0 })
  const [loading, setLoading] = useState(true)
  const user = authService.getUser()

  useEffect(() => { chargerStats() }, [])

  const chargerStats = async () => {
    try {
      const data = await rapportsService.getStatistiques()
      setStats(data || { totalPatients: 0, totalOperations: 0, totalUrgences: 0, totalMedecins: 0 })
    } catch (err) {
      console.error('Erreur stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight">
            Bonjour Dr {user?.nom || 'Sarah RASOANIRINA'}
          </h1>
          <p className="text-xl text-on-surface-variant mt-2">Vos patients aujourd'hui</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Patients', val: stats.totalPatients, icon: 'groups', color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'Opérations', val: stats.totalOperations, icon: 'monitor_heart', color: 'text-green-700', bg: 'bg-green-100' },
            { label: 'Urgences', val: stats.totalUrgences, icon: 'warning', color: 'text-red-700', bg: 'bg-red-100' },
            { label: 'Médecins', val: stats.totalMedecins, icon: 'medical_information', color: 'text-amber-700', bg: 'bg-amber-100' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border flex items-center gap-4">
              <div className={`w-12 h-12 ${kpi.bg} rounded-full flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-2xl ${kpi.color}`}>{kpi.icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">{kpi.label}</p>
                <p className={`text-2xl font-extrabold ${kpi.color}`}>{loading ? '...' : kpi.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Raccourcis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { titre: '📋 Notifications CPA', desc: 'Prescriptions et RDV CPA', lien: '/bloc/notification-cpa' },
            { titre: '📅 Rendez-vous', desc: 'Planning CPA et VPA', lien: '/bloc/rendez-vous' },
            { titre: '👤 Patients du jour', desc: 'Liste des patients à opérer', lien: '/bloc/patient-du-jour' },
            { titre: '🩺 Checklist avant opération', desc: 'Checklist de sécurité', lien: '/bloc/checklist-oms' },
            { titre: '📊 Rapports', desc: 'Statistiques et analyses', lien: '/bloc/rapports' },
            { titre: '🗄️ Archives', desc: 'Patients archivés', lien: '/bloc/archives' },
          ].map((btn, i) => (
            <button key={i} onClick={() => router.push(btn.lien)}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-left border">
              <h3 className="font-bold text-primary">{btn.titre}</h3>
              <p className="text-xs text-gray-500 mt-2">{btn.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
