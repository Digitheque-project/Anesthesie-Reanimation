"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentralAuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const central_auth_guard_1 = require("./central-auth.guard");
const service_token_service_1 = require("./service-token.service");
let CentralAuthModule = class CentralAuthModule {
};
exports.CentralAuthModule = CentralAuthModule;
exports.CentralAuthModule = CentralAuthModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({}), config_1.ConfigModule],
        providers: [central_auth_guard_1.CentralAuthGuard, service_token_service_1.ServiceTokenService],
        exports: [central_auth_guard_1.CentralAuthGuard, service_token_service_1.ServiceTokenService],
    })
], CentralAuthModule);
//# sourceMappingURL=central-auth.module.js.map