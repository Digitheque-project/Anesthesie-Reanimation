import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.log(`Required roles: ${JSON.stringify(requiredRoles)}`);

    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.log('Aucun rôle requis → accès autorisé');
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    this.logger.log(`User role: ${user?.role}`);

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    this.logger.log(`Has required role? ${hasRole}`);

    if (!hasRole) {
      throw new ForbiddenException(
        `Accès refusé. Rôle requis : ${requiredRoles.join(' ou ')}. Votre rôle : ${user.role || 'inconnu'}`,
      );
    }

    return true;
  }
}
