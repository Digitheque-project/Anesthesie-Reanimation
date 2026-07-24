import { SetMetadata } from '@nestjs/common';
import { RoleClinique } from './role-clinique';

// Restreint une route à un ou plusieurs des 5 rôles cliniques du bloc opératoire.
// Vérifié par CentralAuthGuard une fois le token SSO validé et le rôle résolu.
export const REQUIRE_ROLE_CLINIQUE_KEY = 'requireRoleClinique';
export const RequireRoleClinique = (...roles: RoleClinique[]) =>
  SetMetadata(REQUIRE_ROLE_CLINIQUE_KEY, roles);
