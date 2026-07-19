"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoServiceAccessError = void 0;
exports.verifyCentralToken = verifyCentralToken;
class NoServiceAccessError extends Error {
}
exports.NoServiceAccessError = NoServiceAccessError;
async function verifyCentralToken(token, jwtService, config) {
    const secret = config.get('centralAuth.jwtSecret');
    const payload = await jwtService.verifyAsync(token, { secret });
    const serviceId = config.get('externalServices.serviceId');
    const serviceEntry = (payload.services || []).find((s) => s.serviceId === serviceId);
    if (!serviceEntry) {
        throw new NoServiceAccessError("Vous n'avez pas accès au service Bloc Opératoire");
    }
    return {
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
}
//# sourceMappingURL=verify-central-token.js.map