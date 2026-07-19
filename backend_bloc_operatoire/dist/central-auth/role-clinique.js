"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleClinique = void 0;
exports.matchRoleClinique = matchRoleClinique;
var RoleClinique;
(function (RoleClinique) {
    RoleClinique["RESPONSABLE_CPA"] = "RESPONSABLE_CPA";
    RoleClinique["ANESTHESISTE"] = "ANESTHESISTE";
    RoleClinique["CHIRURGIEN"] = "CHIRURGIEN";
    RoleClinique["IBODE"] = "IBODE";
    RoleClinique["MAJOR"] = "MAJOR";
})(RoleClinique || (exports.RoleClinique = RoleClinique = {}));
const DIACRITIQUES = new RegExp('[\\u0300-\\u036f]', 'g');
function matchRoleClinique(roleName) {
    if (!roleName)
        return null;
    const normalise = roleName.normalize('NFD').replace(DIACRITIQUES, '').toLowerCase();
    if (normalise.includes('responsable') && normalise.includes('cpa'))
        return RoleClinique.RESPONSABLE_CPA;
    if (normalise.includes('anesthesist'))
        return RoleClinique.ANESTHESISTE;
    if (normalise.includes('chirurgien'))
        return RoleClinique.CHIRURGIEN;
    if (normalise.includes('ibode'))
        return RoleClinique.IBODE;
    if (normalise.includes('major'))
        return RoleClinique.MAJOR;
    return null;
}
//# sourceMappingURL=role-clinique.js.map