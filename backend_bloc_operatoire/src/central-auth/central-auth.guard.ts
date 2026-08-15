import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from './public.decorator';
import { CentralUser } from './central-user.interface';
import { REQUIRE_ROLE_CLINIQUE_KEY } from './require-role.decorator';
import { REQUIRE_PERMISSION_KEY } from './require-permission.decorator';
import { matchRoleClinique } from './role-clinique';
import {
  verifyCentralToken,
  NoServiceAccessError,
} from './verify-central-token';

// Verifie le token emis par le SSO central (auth-service) au login. Aucun acces a l'API
// n'est autorise sans ce token, sauf sur les routes explicitement marquees @Public()
// (webhooks entrants d'autres services, auth locale historique).
//
// Modele d'autorisation :
//  - Par defaut, une route exige l'APPARTENANCE au service Bloc Operatoire.
//  - Une route annotee @RequirePermission('ressource:action') accepte en plus les utilisateurs
//    d'un autre service du CHU portant cette permission (acces externe, lecture seule).
//  - Une route annotee @RequireRoleClinique(...) exige toujours l'appartenance au bloc : un
//    acces externe y est refuse, quelles que soient ses permissions.
@Injectable()
export class CentralAuthGuard implements CanActivate {
  private readonly logger = new Logger(CentralAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token)
      throw new UnauthorizedException('Connexion requise (SSO central)');

    const rolesRequis = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_ROLE_CLINIQUE_KEY,
      [context.getHandler(), context.getClass()],
    );
    const permissionRequise = this.reflector.getAllAndOverride<string>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Une route reservee a un role clinique reste reservee aux membres du bloc : on n'ouvre
    // jamais le repli par permission sur une ecriture.
    const permissionRepli =
      rolesRequis && rolesRequis.length > 0 ? undefined : permissionRequise;

    let centralUser: CentralUser;
    try {
      centralUser = await verifyCentralToken(
        token,
        this.jwtService,
        this.config,
        { permissionRepli },
      );
    } catch (err) {
      if (err instanceof NoServiceAccessError) {
        throw new ForbiddenException(err.message);
      }
      this.logger.warn(`Token SSO invalide: ${(err as Error).message}`);
      throw new UnauthorizedException(
        'Session expiree ou invalide, veuillez vous reconnecter',
      );
    }

    request.centralUser = centralUser;

    if (rolesRequis && rolesRequis.length > 0) {
      if (centralUser.accesExterne) {
        throw new ForbiddenException(
          `Action reservee aux membres du service Bloc Operatoire (role ${rolesRequis.join(' ou ')})`,
        );
      }
      const roleUtilisateur = matchRoleClinique(centralUser.role);
      if (!roleUtilisateur || !rolesRequis.includes(roleUtilisateur)) {
        throw new ForbiddenException(
          `Action reservee au role ${rolesRequis.join(' ou ')} (votre role : ${centralUser.role})`,
        );
      }
    }

    // Acces externe : la permission demandee par la route doit etre presente dans le service
    // qui a servi a l'autoriser. Les membres du bloc restent autorises par appartenance.
    if (
      permissionRequise &&
      centralUser.accesExterne &&
      !centralUser.permissions.includes(permissionRequise)
    ) {
      throw new ForbiddenException(
        `Permission ${permissionRequise} requise pour acceder a cette ressource`,
      );
    }

    return true;
  }

  private extractToken(request: any): string | undefined {
    const auth = request.headers?.authorization;
    if (typeof auth === 'string' && auth.startsWith('Bearer '))
      return auth.slice(7);
    return undefined;
  }
}
