"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NIVEAUX_URGENTS = void 0;
exports.niveauDepuisEchelle = niveauDepuisEchelle;
exports.niveauDepuisLibelle = niveauDepuisLibelle;
exports.estNiveauUrgent = estNiveauUrgent;
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
function niveauDepuisEchelle(urgence) {
    const valeur = Number(urgence);
    if (!Number.isFinite(valeur))
        return patient_bloc_entity_1.NiveauUrgence.NORMAL;
    if (valeur >= 5)
        return patient_bloc_entity_1.NiveauUrgence.TRES_URGENT;
    if (valeur >= 3)
        return patient_bloc_entity_1.NiveauUrgence.URGENT;
    return patient_bloc_entity_1.NiveauUrgence.NORMAL;
}
function niveauDepuisLibelle(urgence) {
    if (typeof urgence === 'number')
        return niveauDepuisEchelle(urgence);
    const u = String(urgence ?? '')
        .trim()
        .toUpperCase();
    if (u === '')
        return patient_bloc_entity_1.NiveauUrgence.NORMAL;
    if (/^\d+$/.test(u))
        return niveauDepuisEchelle(Number(u));
    if (u === 'TRES_URGENT' || u === 'TRÈS_URGENT' || u === 'STAT')
        return patient_bloc_entity_1.NiveauUrgence.TRES_URGENT;
    if (u === 'URGENT' || u === 'URGENTE' || u === 'URGENCE')
        return patient_bloc_entity_1.NiveauUrgence.URGENT;
    return patient_bloc_entity_1.NiveauUrgence.NORMAL;
}
function estNiveauUrgent(niveau) {
    return niveau !== patient_bloc_entity_1.NiveauUrgence.NORMAL;
}
exports.NIVEAUX_URGENTS = [
    patient_bloc_entity_1.NiveauUrgence.URGENT,
    patient_bloc_entity_1.NiveauUrgence.TRES_URGENT,
];
//# sourceMappingURL=urgence.js.map