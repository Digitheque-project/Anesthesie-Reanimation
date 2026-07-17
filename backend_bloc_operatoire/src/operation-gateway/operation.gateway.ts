import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { verifyCentralToken } from '../central-auth/verify-central-token';
import { CORS_ORIGINS } from '../config/cors-origins';

// Synchronisation temps réel entre les postes travaillant sur le même patient pendant
// l'opération (moments opératoires, constantes, checklists). Une "room" par patientId — il
// n'existe pas d'entité "opération" distincte dans le schéma, et la machine à états
// PatientStatut garantit un seul parcours actif à la fois par patient, donc patientId est une
// clé de room fiable. Authentification identique au REST (même JWT central), vérifiée une fois
// à la connexion.
@WebSocketGateway({
  namespace: '/bloc/ws/operation',
  cors: { origin: CORS_ORIGINS, credentials: true },
})
export class OperationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(OperationGateway.name);

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) throw new Error('Token manquant');
      client.data.centralUser = await verifyCentralToken(token, this.jwtService, this.config);
    } catch (err) {
      this.logger.warn(`Connexion WebSocket refusée: ${(err as Error).message}`);
      client.emit('erreur-auth', { message: 'Authentification WebSocket invalide' });
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('rejoindre-operation')
  rejoindre(@ConnectedSocket() client: Socket, @MessageBody() data: { patientId: string }) {
    if (!client.data.centralUser || !data?.patientId) return;
    client.join(`operation:${data.patientId}`);
    client.emit('operation-rejointe', { patientId: data.patientId });
  }

  @SubscribeMessage('quitter-operation')
  quitter(@ConnectedSocket() client: Socket, @MessageBody() data: { patientId: string }) {
    if (!data?.patientId) return;
    client.leave(`operation:${data.patientId}`);
  }

  // Diffuse un événement à tous les postes connectés sur ce patient — appelée par les services
  // métier après une écriture DB réussie (jamais avant, jamais dans un catch qui masquerait un
  // échec de sauvegarde).
  emitToOperation(patientId: string, event: string, payload: unknown) {
    this.server?.to(`operation:${patientId}`).emit(event, payload);
  }
}
