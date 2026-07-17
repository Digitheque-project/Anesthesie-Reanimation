import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CentralUser } from './central-user.interface';

// Distingue "token invalide/expiré" de "token valide mais sans accès à ce service" — les deux
// canaux (HTTP, WebSocket) ont besoin de réagir différemment à ces deux cas (401 vs 403 côté
// HTTP notamment).
export class NoServiceAccessError extends Error {}

// Vérifie un token émis par le SSO central et en dérive le CentralUser pour CE service (Bloc
// Opératoire). Partagé entre CentralAuthGuard (HTTP) et OperationGateway (WebSocket) pour que
// les deux canaux appliquent exactement la même vérification.
export async function verifyCentralToken(
  token: string,
  jwtService: JwtService,
  config: ConfigService,
): Promise<CentralUser> {
  const secret = config.get<string>('centralAuth.jwtSecret');
  const payload: any = await jwtService.verifyAsync(token, { secret });

  const serviceId = config.get<string>('externalServices.serviceId');
  const serviceEntry = (payload.services || []).find((s: any) => s.serviceId === serviceId);
  if (!serviceEntry) {
    throw new NoServiceAccessError("Vous n'avez pas accès au service Bloc Opératoire");
  }

  return {
    userId: payload.userId,
    nom: payload.name,
    prenom: payload.firstname,
    email: payload.email,
    serviceId: serviceEntry.serviceId,
    roleId: serviceEntry.roleId,
    role: serviceEntry.roleName,
    permissions: serviceEntry.permissions || [],
    chu: serviceEntry.chu,
  };
}
