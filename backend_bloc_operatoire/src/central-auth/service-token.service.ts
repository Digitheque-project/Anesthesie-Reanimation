import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Jeton signé par notre propre service, pour les appels serveur-à-serveur sans utilisateur
// connecté (jobs de fond, polling) vers d'autres services de l'écosystème SSO — ils partagent
// le même secret HS256 que la gateway centrale (CENTRAL_AUTH_JWT_SECRET) et acceptent donc ce
// jeton comme n'importe quel jeton émis par elle. Confirmé en le testant contre le service
// Prescription : un jeton avec cette forme, signé avec ce secret, est accepté (200).
@Injectable()
export class ServiceTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  mint(): string {
    const serviceId = this.config.get<string>('externalServices.serviceId');
    const chuId = this.config.get<string>('externalServices.chuId');
    const secret = this.config.get<string>('centralAuth.jwtSecret');

    return this.jwt.sign(
      {
        userId: `service-${serviceId}`,
        name: 'Service',
        firstname: 'Anesthésie-Réanimation',
        email: 'service@anesthesie-reanimation.local',
        services: [
          {
            serviceId,
            serviceName: 'Service Anesthésie-Réanimation',
            baseUrl: '',
            roleId: 'service-account',
            roleName: 'Service',
            permissions: ['prescription:read'],
            chu: { id: chuId },
          },
        ],
      },
      { secret, expiresIn: '5m' },
    );
  }
}
