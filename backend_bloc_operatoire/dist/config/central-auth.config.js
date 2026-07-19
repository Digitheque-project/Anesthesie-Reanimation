"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('centralAuth', () => ({
    jwtSecret: process.env.CENTRAL_AUTH_JWT_SECRET,
    authServiceUrl: process.env.CENTRAL_AUTH_SERVICE_URL,
    userServiceUrl: process.env.CENTRAL_USER_SERVICE_URL,
    serviceRegistryUrl: process.env.CENTRAL_SERVICE_REGISTRY_URL,
    chuServiceUrl: process.env.CENTRAL_CHU_SERVICE_URL,
    loginUrl: process.env.CENTRAL_LOGIN_URL,
}));
//# sourceMappingURL=central-auth.config.js.map