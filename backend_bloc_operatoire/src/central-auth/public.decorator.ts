import { SetMetadata } from '@nestjs/common';

// Marque une route comme accessible sans le token du SSO central — réservé aux endpoints
// appelés par d'autres services (webhooks entrants) ou à l'auth locale historique.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
