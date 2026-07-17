'use client'

import { useRouter } from 'next/navigation'

interface TableauNotificationsProps {
  notifications: any[]
  peutPlanifier: boolean
  onPlanifier: (notif: any) => void
  onActionUrgent: (notif: any) => void
  onVoirDossier: (notif: any) => void
}

export default function TableauNotifications({
  notifications,
  peutPlanifier,
  onPlanifier,
  onActionUrgent,
  onVoirDossier
}: TableauNotificationsProps) {
  const router = useRouter()

  const estPatientStat = (notif: any) => Boolean(notif.estUrgent || notif.urgence === 3)

  return (
    <div className="bg-white rounded-xl shadow-md border border-outline-variant/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80 text-xs font-semibold uppercase text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 text-left">Heure</th>
              <th className="px-4 py-3 text-left">Patient</th>
              <th className="px-4 py-3 text-left">Intervention</th>
              <th className="px-4 py-3 text-left">Prescripteur</th>
              <th className="px-4 py-3 text-left">Urgent</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {notifications.map((n, idx) => {
              const isStat = estPatientStat(n)
              return (
                <tr
                  key={n.id || idx}
                  onClick={() => onVoirDossier(n)}
                  className="hover:bg-primary/5 transition cursor-pointer"
                >
                  <td className="px-4 py-3 font-mono text-sm">{n.heure || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-on-surface">
                      {n.patientNom || n.patient?.nom || 'Patient'}
                      {isStat && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full">
                          ⚡ STAT
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-on-surface-variant">{n.patientId || n.patient?.id || ''}</div>
                  </td>
                  <td className="px-4 py-3">{n.intervention || n.motif || '-'}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{n.prescripteur || n.professeurCPA || '-'}</td>
                  <td className="px-4 py-3">
                    {isStat ? (
                      <span className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full animate-pulse">
                        🔴 URGENT
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded-full">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isStat) {
                          // Patient STAT → VPA direct
                          onActionUrgent(n)
                        } else {
                          // Patient normal → Planifier CPA
                          onPlanifier(n)
                        }
                      }}
                      disabled={!isStat && !peutPlanifier}
                      title={!isStat && !peutPlanifier ? 'Planification réservée au Responsable CPA ou au Major' : undefined}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed ${
                        isStat
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                    >
                      {isStat ? '⚡ VPA Direct' : '📋 Planifier CPA'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
