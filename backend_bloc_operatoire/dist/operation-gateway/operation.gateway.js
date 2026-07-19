"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OperationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationGateway = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const verify_central_token_1 = require("../central-auth/verify-central-token");
const cors_origins_1 = require("../config/cors-origins");
let OperationGateway = OperationGateway_1 = class OperationGateway {
    jwtService;
    config;
    server;
    logger = new common_1.Logger(OperationGateway_1.name);
    constructor(jwtService, config) {
        this.jwtService = jwtService;
        this.config = config;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token;
            if (!token)
                throw new Error('Token manquant');
            client.data.centralUser = await (0, verify_central_token_1.verifyCentralToken)(token, this.jwtService, this.config);
        }
        catch (err) {
            this.logger.warn(`Connexion WebSocket refusée: ${err.message}`);
            client.emit('erreur-auth', { message: 'Authentification WebSocket invalide' });
            client.disconnect(true);
        }
    }
    handleDisconnect(_client) { }
    rejoindre(client, data) {
        if (!client.data.centralUser || !data?.patientId)
            return;
        client.join(`operation:${data.patientId}`);
        client.emit('operation-rejointe', { patientId: data.patientId });
    }
    quitter(client, data) {
        if (!data?.patientId)
            return;
        client.leave(`operation:${data.patientId}`);
    }
    emitToOperation(patientId, event, payload) {
        this.server?.to(`operation:${patientId}`).emit(event, payload);
    }
};
exports.OperationGateway = OperationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], OperationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('rejoindre-operation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], OperationGateway.prototype, "rejoindre", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('quitter-operation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], OperationGateway.prototype, "quitter", null);
exports.OperationGateway = OperationGateway = OperationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/bloc/ws/operation',
        cors: { origin: cors_origins_1.CORS_ORIGINS, credentials: true },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], OperationGateway);
//# sourceMappingURL=operation.gateway.js.map