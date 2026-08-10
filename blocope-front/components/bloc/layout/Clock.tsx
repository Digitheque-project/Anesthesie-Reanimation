'use client'

import { useEffect, useState } from 'react'

// Horloge temps réel (heure + date), affichée en permanence dans la barre supérieure à côté de
// la cloche de notifications — utile au personnel du bloc, où l'heure exacte compte (CPA,
// vérifications veille, interventions). Rafraîchie chaque seconde.
export default function Clock() {
  const [maintenant, setMaintenant] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setMaintenant(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const heure = maintenant.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const date = maintenant.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div
      className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-container-lowest border border-outline-variant/30 shadow-sm select-none"
      aria-label={`Heure actuelle : ${heure}`}
    >
      <span
        className="material-symbols-outlined text-primary text-xl"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        schedule
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-extrabold text-on-surface tabular-nums tracking-tight">
          {heure}
        </span>
        <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wide">
          {date}
        </span>
      </div>
    </div>
  )
}
