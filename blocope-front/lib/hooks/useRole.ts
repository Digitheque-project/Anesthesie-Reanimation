'use client'
import { authService } from '@/lib/api/auth.service';
export function useRole() {
  const user = authService.getUser();
  return {
    role: user?.role || null,
    nom: user?.nom || '',
    estAnesthesiste: user?.role === 'ROLE_ANESTHESISTE',
    estChirurgien: user?.role === 'ROLE_CHIRURGIEN',
    estInfirmier: user?.role === 'ROLE_INFIRMIER_BLOC',
    estSecretaire: user?.role === 'ROLE_SECRETAIRE_MEDICALE',
    estDirecteur: user?.role === 'ROLE_DIRECTEUR_MEDICAL',
    estAdmin: user?.role === 'ROLE_ADMIN',
    peutFaireCPA: user?.role === 'ROLE_ANESTHESISTE',
    peutFaireVPA: user?.role === 'ROLE_ANESTHESISTE',
    peutFaireScoreSCCRE: ['ROLE_ANESTHESISTE', 'ROLE_INFIRMIER_BLOC'].includes(user?.role || ''),
    peutValiderSortie: user?.role === 'ROLE_ANESTHESISTE',
    peutVoirRapports: ['ROLE_DIRECTEUR_MEDICAL', 'ROLE_ADMIN'].includes(user?.role || ''),
    peutPlanifierRDV: ['ROLE_ANESTHESISTE', 'ROLE_SECRETAIRE_MEDICALE'].includes(user?.role || ''),
  };
}
