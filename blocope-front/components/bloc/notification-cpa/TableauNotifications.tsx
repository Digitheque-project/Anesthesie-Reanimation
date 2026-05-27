'use client'

import { NotificationCPA } from '@/types/bloc'

interface TableauNotificationsProps {
  notifications: NotificationCPA[]
  onPlanifier?: (notification: NotificationCPA) => void
  onVoirDossier?: (notification: NotificationCPA) => void
}

export default function TableauNotifications({ notifications, onPlanifier, onVoirDossier }: TableauNotificationsProps) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden overflow-x-auto max-h-[500px] overflow-y-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-dim/30">
            <th className="px-6 py-4 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
              Heure Prescription
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
              Patient (Nom & ID)
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
              Intervention
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
              Chirurgien (Prescripteur)
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
              Professeur Responsable CPA
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y-0">
          {notifications.map((n) => (
            <tr key={n.id} className="hover:bg-surface-container-high/50 transition-colors group">
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-sm ${n.estUrgent ? 'text-tertiary' : 'text-blue-400'}`}>
                    {n.estUrgent ? 'warning' : 'schedule'}
                  </span>
                  <span className={`font-bold ${n.estUrgent ? 'text-tertiary' : 'text-on-surface'}`}>
                    {n.heurePrescription}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="font-bold text-primary font-headline">
                    {n.patient.nom}
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono">
                    {n.patient.idDossier}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${n.estUrgent ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold uppercase tracking-tighter' : 'bg-blue-50 text-blue-700'}`}>
                  {n.intervention}
                </span>
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-on-surface">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-surface-dim flex items-center justify-center text-[10px] font-bold text-primary">
                    {n.chirurgien.initiales}
                  </span>
                  <span className="text-sm font-medium">
                    {n.chirurgien.nom}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <span className="text-sm font-medium text-on-surface">
                  {n.professeurCPA}
                </span>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onVoirDossier?.(n)}
                    className="px-3 py-2 rounded-lg text-xs font-bold border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-all flex items-center gap-1"
                    title="Voir le dossier patient"
                  >
                    <span className="material-symbols-outlined text-sm">folder_open</span>
                    Dossier
                  </button>
                  <button
                    onClick={() => onPlanifier?.(n)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${n.estUrgent ? 'bg-tertiary hover:bg-tertiary-container text-white' : 'bg-primary hover:bg-primary-container text-white'}`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {n.estUrgent ? 'bolt' : 'calendar_month'}
                    </span>
                    {n.estUrgent ? 'Fixer RDV IMMÉDIAT' : 'Planifier Rendez-vous'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
