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
var CentralAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentralAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const public_decorator_1 = require("./public.decorator");
const require_role_decorator_1 = require("./require-role.decorator");
const role_clinique_1 = require("./role-clinique");
const verify_central_token_1 = require("./verify-central-token");
let CentralAuthGuard = CentralAuthGuard_1 = class CentralAuthGuard {
    reflector;
    jwtService;
    config;
    logger = new common_1.Logger(CentralAuthGuard_1.name);
    constructor(reflector, jwtService, config) {
        this.reflector = reflector;
        this.jwtService = jwtService;
        this.config = config;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token)
            throw new common_1.UnauthorizedException('Connexion requise (SSO central)');
        let centralUser;
        try {
            centralUser = await (0, verify_central_token_1.verifyCentralToken)(token, this.jwtService, this.config);
        }
        catch (err) {
            if (err instanceof verify_central_token_1.NoServiceAccessError) {
                throw new common_1.ForbiddenException(err.message);
            }
            this.logger.warn(`Token SSO invalide: ${err.message}`);
            throw new common_1.UnauthorizedException('Session expirée ou invalide, veuillez vous reconnecter');
        }
        request.centralUser = centralUser;
        const rolesRequis = this.reflector.getAllAndOverride(require_role_decorator_1.REQUIRE_ROLE_CLINIQUE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (rolesRequis && rolesRequis.length > 0) {
            const roleUtilisateur = (0, role_clinique_1.matchRoleClinique)(centralUser.role);
            if (!roleUtilisateur || !rolesRequis.includes(roleUtilisateur)) {
                throw new common_1.ForbiddenException(`Action réservée au rôle ${rolesRequis.join(' ou ')} (votre rôle : ${centralUser.role})`);
            }
        }
        return true;
    }
    extractToken(request) {
        const auth = request.headers?.authorization;
        if (typeof auth === 'string' && auth.startsWith('Bearer '))
            return auth.slice(7);
        return undefined;
    }
};
exports.CentralAuthGuard = CentralAuthGuard;
exports.CentralAuthGuard = CentralAuthGuard = CentralAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_1.JwtService,
        config_1.ConfigService])
], CentralAuthGuard);
//# sourceMappingURL=central-auth.guard.js.map