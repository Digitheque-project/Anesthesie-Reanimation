'use client'

import { useEffect, useState } from 'react'
import { obtenirSessionValide } from '@/lib/auth/central-session'
import { RoleClinique, matchRoleClinique } from '@/lib/auth/role-clinique'

// Résout le rôle clinique de l'utilisateur connecté depuis la session SSO centrale (pas de
// fetch réseau, tout est déjà dans le token décodé côté client).
export function useRole() {
  const [roleName, setRoleName] = useState<string | null>(null)

  useEffect(() => {
    const session = obtenirSessionValide()
    setRoleName(session?.acces.roleName || null)
  }, [])

  const role = matchRoleClinique(roleName)

  return {
    roleName,
    role,
    estResponsableCpa: role === RoleClinique.RESPONSABLE_CPA,
    estAnesthesiste: role === RoleClinique.ANESTHESISTE,
    estChirurgien: role === RoleClinique.CHIRURGIEN,
    estIbode: role === RoleClinique.IBODE,
    estMajor: role === RoleClinique.MAJOR,
    peutDeciderCpa: role === RoleClinique.RESPONSABLE_CPA,
    peutGererCreneaux: role === RoleClinique.MAJOR,
    peutValiderSortieReveil: role === RoleClinique.ANESTHESISTE,
  }
}
