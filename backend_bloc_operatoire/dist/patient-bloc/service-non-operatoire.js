"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estServiceNonOperatoire = estServiceNonOperatoire;
exports.aSaPropreSalleDeReveil = aSaPropreSalleDeReveil;
const DIACRITIQUES = new RegExp('[\\u0300-\\u036f]', 'g');
function normaliser(valeur) {
    return valeur.normalize('NFD').replace(DIACRITIQUES, '').toLowerCase();
}
function motsClesConfigures(variable) {
    return (process.env[variable] ?? '')
        .split(',')
        .map((mot) => normaliser(mot.trim()))
        .filter((mot) => mot !== '');
}
const MOTS_CLES_NON_OPERATOIRE = [
    'imagerie',
    'radiologie',
    'scanner',
    'tomodensitometrie',
    'tdm',
    'irm',
    'echographie',
    'endoscopie',
    'urgence',
];
function estServiceNonOperatoire(serviceOrigine) {
    if (!serviceOrigine)
        return false;
    const normalise = normaliser(serviceOrigine);
    return [
        ...MOTS_CLES_NON_OPERATOIRE,
        ...motsClesConfigures('SERVICES_NON_OPERATOIRES'),
    ].some((mot) => normalise.includes(mot));
}
const MOTS_CLES_PROPRE_SALLE_REVEIL = [
    'imagerie',
    'radiologie',
    'scanner',
    'tomodensitometrie',
    'tdm',
    'irm',
];
function aSaPropreSalleDeReveil(serviceOrigine) {
    if (!serviceOrigine)
        return false;
    const normalise = normaliser(serviceOrigine);
    return [
        ...MOTS_CLES_PROPRE_SALLE_REVEIL,
        ...motsClesConfigures('SERVICES_AVEC_SALLE_REVEIL'),
    ].some((mot) => normalise.includes(mot));
}
//# sourceMappingURL=service-non-operatoire.js.map