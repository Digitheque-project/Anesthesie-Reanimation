import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from './public.decorator';
import { CentralUser } from './central-user.interface';

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
    if (!token) throw new UnauthorizedException('Connexion requise (SSO central)');

    const secret = this.config.get<string>('centralAuth.jwtSecret');
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token, { secret });
    } catch (err) {
      this.logger.warn(`Token SSO invalide: ${(err as Error).message}`);
      throw new UnauthorizedException('Session expirée ou invalide, veuillez vous reconnecter');
    }

    const serviceId = this.config.get<string>('externalServices.serviceId');
    const serviceEntry = (payload.services || []).find((s: any) => s.serviceId === serviceId);
    if (!serviceEntry) {
      throw new ForbiddenException("Vous n'avez pas accès au service Bloc Opératoire");
    }

    const centralUser: CentralUser = {
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
    request.centralUser = centralUser;
    return true;
  }

  private extractToken(request: any): string | undefined {
    const auth = request.headers?.authorization;
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7);
    return undefined;
  }
}
