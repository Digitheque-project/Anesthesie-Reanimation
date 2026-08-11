"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estServiceNonOperatoire = estServiceNonOperatoire;
const DIACRITIQUES = new RegExp('[\\u0300-\\u036f]', 'g');
const MOTS_CLES_NON_OPERATOIRE = ['imagerie', 'scanner', 'endoscopie', 'urgence'];
function estServiceNonOperatoire(serviceOrigine) {
    if (!serviceOrigine)
        return false;
    const normalise = serviceOrigine
        .normalize('NFD')
        .replace(DIACRITIQUES, '')
        .toLowerCase();
    return MOTS_CLES_NON_OPERATOIRE.some((mot) => normalise.includes(mot));
}
//# sourceMappingURL=service-non-operatoire.js.map