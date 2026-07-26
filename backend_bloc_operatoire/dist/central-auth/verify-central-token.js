"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoServiceAccessError = void 0;
exports.verifyCentralToken = verifyCentralToken;
class NoServiceAccessError extends Error {
}
exports.NoServiceAccessError = NoServiceAccessError;
function versCentralUser(payload, entree, accesExterne) {
    return {
        userId: payload.userId,
        nom: payload.name,
        prenom: payload.firstname,
        email: payload.email,
        serviceId: entree.serviceId,
        roleId: entree.roleId,
        role: entree.roleName,
        permissions: entree.permissions || [],
        accesExterne,
        chu: entree.chu,
    };
}
async function verifyCentralToken(token, jwtService, config, options = {}) {
    const secret = config.get('centralAuth.jwtSecret');
    const payload = await jwtService.verifyAsync(token, { secret });
    const serviceId = config.get('externalServices.serviceId');
    const services = Array.isArray(payload.services)
        ? payload.services
        : [];
    const entreeBloc = services.find((s) => s.serviceId === serviceId);
    if (entreeBloc)
        return versCentralUser(payload, entreeBloc, false);
    const permission = options.permissionRepli;
    if (permission) {
        const entreeAutorisee = services.find((s) => (s.permissions || []).includes(permission));
        if (entreeAutorisee)
            return versCentralUser(payload, entreeAutorisee, true);
        throw new NoServiceAccessError(`Acces refuse : votre token ne contient ni le service Bloc Operatoire, ni la permission ${permission}`);
    }
    throw new NoServiceAccessError("Vous n'avez pas acces au service Bloc Operatoire");
}
//# sourceMappingURL=verify-central-token.js.map