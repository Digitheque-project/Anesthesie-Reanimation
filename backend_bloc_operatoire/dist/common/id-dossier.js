"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.construireIdDossier = construireIdDossier;
const LONGUEUR_MAX = 50;
function construireIdDossier(patientId) {
    const base = `CHU-${String(patientId ?? '').trim()}`;
    return base.length > LONGUEUR_MAX ? base.slice(0, LONGUEUR_MAX) : base;
}
//# sourceMappingURL=id-dossier.js.map