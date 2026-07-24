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
import { matchRoleClinique } from './role-clinique';
import {
  verifyCentralToken,
  NoServiceAccessError,
} from './verify-central-token';

// Vérifie le token émis par le SSO central (auth-service) au login. Aucun accès à l'API
// n'est autorisé sans ce token, sauf sur les routes explicitement marquées @Public()
// (webhooks entrants d'autres services, auth locale historique).
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

    let centralUser: CentralUser;
    try {
      centralUser = await verifyCentralToken(
        token,
        this.jwtService,
        this.config,
      );
    } catch (err) {
      if (err instanceof NoServiceAccessError) {
        throw new ForbiddenException(err.message);
      }
      this.logger.warn(`Token SSO invalide: ${(err as Error).message}`);
      throw new UnauthorizedException(
        'Session expirée ou invalide, veuillez vous reconnecter',
      );
    }

    request.centralUser = centralUser;

    const rolesRequis = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_ROLE_CLINIQUE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (rolesRequis && rolesRequis.length > 0) {
      const roleUtilisateur = matchRoleClinique(centralUser.role);
      if (!roleUtilisateur || !rolesRequis.includes(roleUtilisateur)) {
        throw new ForbiddenException(
          `Action réservée au rôle ${rolesRequis.join(' ou ')} (votre rôle : ${centralUser.role})`,
        );
      }
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
