import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CentralUser } from './central-user.interface';

// Distingue "token invalide/expire" de "token valide mais sans acces a ce service" - les deux
// canaux (HTTP, WebSocket) ont besoin de reagir differemment a ces deux cas (401 vs 403 cote
// HTTP notamment).
export class NoServiceAccessError extends Error {}

// Une entree du tableau services[] du token central.
type ServiceEntry = {
  serviceId?: string;
  serviceName?: string;
  roleId?: string;
  roleName?: string;
  permissions?: string[];
  chu?: CentralUser['chu'];
};

export type VerifyCentralTokenOptions = {
  // Permission acceptee en repli quand le token ne contient AUCUNE entree pour le service Bloc
  // Operatoire : si un autre service du CHU porte cette permission, l'acces est accorde en mode
  // externe (accesExterne = true). Renseignee par CentralAuthGuard depuis @RequirePermission.
  // Omise => comportement strict historique (appartenance au service obligatoire).
  permissionRepli?: string;
};

function versCentralUser(
  payload: Record<string, any>,
  entree: ServiceEntry,
  accesExterne: boolean,
): CentralUser {
  return {
    userId: payload.userId,
    nom: payload.name,
    prenom: payload.firstname,
    email: payload.email,
    serviceId: entree.serviceId as string,
    roleId: entree.roleId as string,
    role: entree.roleName as string,
    permissions: entree.permissions || [],
    accesExterne,
    chu: entree.chu as CentralUser['chu'],
  };
}

// Verifie un token emis par le SSO central et en derive le CentralUser pour CE service (Bloc
// Operatoire). Partage entre CentralAuthGuard (HTTP) et OperationGateway (WebSocket) pour que
// les deux canaux appliquent exactement la meme verification.
//
// Deux voies d'autorisation, dans cet ordre :
//  1. Appartenance au service - le token contient une entree dont serviceId == SERVICE_ID.
//     C'est la voie normale : acces complet, lecture comme ecriture (selon le role clinique).
//  2. Autorisation par permission (repli) - aucune entree Bloc, mais un autre service du CHU
//     porte la permission demandee par la route. Acces en LECTURE seule, marque accesExterne.
//     Cela evite de rattacher artificiellement au bloc les comptes des services cliniques qui
//     ne font que consulter (programme operatoire, archives...), et rend l'ouverture a un
//     nouveau service purement declarative cote SSO, sans redeploiement du bloc.
export async function verifyCentralToken(
  token: string,
  jwtService: JwtService,
  config: ConfigService,
  options: VerifyCentralTokenOptions = {},
): Promise<CentralUser> {
  const secret = config.get<string>('centralAuth.jwtSecret');
  const payload: any = await jwtService.verifyAsync(token, { secret });

  const serviceId = config.get<string>('externalServices.serviceId');
  const services: ServiceEntry[] = Array.isArray(payload.services)
    ? payload.services
    : [];

  const entreeBloc = services.find((s) => s.serviceId === serviceId);
  if (entreeBloc) return versCentralUser(payload, entreeBloc, false);

  const permission = options.permissionRepli;
  if (permission) {
    const entreeAutorisee = services.find((s) =>
      (s.permissions || []).includes(permission),
    );
    if (entreeAutorisee) return versCentralUser(payload, entreeAutorisee, true);

    throw new NoServiceAccessError(
      `Acces refuse : votre token ne contient ni le service Bloc Operatoire, ni la permission ${permission}`,
    );
  }

  throw new NoServiceAccessError(
    "Vous n'avez pas acces au service Bloc Operatoire",
  );
}
