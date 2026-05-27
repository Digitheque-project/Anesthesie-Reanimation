'use client'

interface StatsNotificationProps {
  stats: {
    enAttente: number
    prioriteHaute: number
    rdvFixes24h: number
  }
}

export default function StatsNotification({ stats }: StatsNotificationProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="bg-surface-container-lowest p-5 rounded-xl flex flex-col gap-2">
        <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">
          En attente
        </span>
        <span className="text-3xl font-extrabold text-primary font-headline">
          {stats.enAttente}
        </span>
        <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded-full font-bold">
          +2 ce matin
        </span>
      </div>

      <div className="bg-surface-container-lowest p-5 rounded-xl flex flex-col gap-2">
        <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">
          Priorité Haute
        </span>
        <div className="flex items-end justify-between gap-4">
          <span className="text-3xl font-extrabold text-tertiary font-headline">
            {stats.prioriteHaute}
          </span>
          <span className="material-symbols-outlined text-tertiary">priority_high</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-5 rounded-xl flex flex-col gap-2">
        <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">
          RDV Fixés (24h)
        </span>
        <div className="flex items-end justify-between gap-4">
          <span className="text-3xl font-extrabold text-secondary font-headline">
            {stats.rdvFixes24h}
          </span>
          <span className="material-symbols-outlined text-secondary">check_circle</span>
        </div>
      </div>
    </div>
  )
}
