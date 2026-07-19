import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class OperationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private config;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, config: ConfigService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(_client: Socket): void;
    rejoindre(client: Socket, data: {
        patientId: string;
    }): void;
    quitter(client: Socket, data: {
        patientId: string;
    }): void;
    emitToOperation(patientId: string, event: string, payload: unknown): void;
}
