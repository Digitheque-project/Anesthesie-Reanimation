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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientBloc = exports.NiveauUrgence = exports.PatientStatut = void 0;
const typeorm_1 = require("typeorm");
var PatientStatut;
(function (PatientStatut) {
    PatientStatut["EN_ATTENTE_CPA"] = "EN_ATTENTE_CPA";
    PatientStatut["CPA_REALISE"] = "CPA_REALISE";
    PatientStatut["CPA_INAPTE"] = "CPA_INAPTE";
    PatientStatut["EN_ATTENTE_VERIFICATION_VEILLE"] = "EN_ATTENTE_VERIFICATION_VEILLE";
    PatientStatut["VERIFICATION_VEILLE_REALISEE"] = "VERIFICATION_VEILLE_REALISEE";
    PatientStatut["PRET_POUR_BLOC"] = "PRET_POUR_BLOC";
    PatientStatut["EN_COURS_OPERATION"] = "EN_COURS_OPERATION";
    PatientStatut["EN_SALLE_REVEIL"] = "EN_SALLE_REVEIL";
    PatientStatut["SORTI"] = "SORTI";
})(PatientStatut || (exports.PatientStatut = PatientStatut = {}));
var NiveauUrgence;
(function (NiveauUrgence) {
    NiveauUrgence["TRES_URGENT"] = "TRES_URGENT";
    NiveauUrgence["URGENT"] = "URGENT";
    NiveauUrgence["NORMAL"] = "NORMAL";
})(NiveauUrgence || (exports.NiveauUrgence = NiveauUrgence = {}));
let PatientBloc = class PatientBloc {
    patientId;
    chuId;
    idDossier;
    groupeSanguin;
    libelle;
    risqueHemorragique;
    typeChirurgie;
    consignes;
    dateIntervention;
    alertes;
    prescripteurId;
    chirurgien_nom;
    statut;
    niveauUrgence;
    chambre;
    serviceOrigine;
    serviceOrigineId;
    motifRefusCpa;
    prescriptionExterneId;
    createdAt;
    updatedAt;
};
exports.PatientBloc = PatientBloc;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 50 }),
    __metadata("design:type", String)
], PatientBloc.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], PatientBloc.prototype, "chuId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, unique: true }),
    __metadata("design:type", String)
], PatientBloc.prototype, "idDossier", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], PatientBloc.prototype, "groupeSanguin", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], PatientBloc.prototype, "libelle", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], PatientBloc.prototype, "risqueHemorragique", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], PatientBloc.prototype, "typeChirurgie", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatientBloc.prototype, "consignes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PatientBloc.prototype, "dateIntervention", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatientBloc.prototype, "alertes", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 36, nullable: true }),
    __metadata("design:type", String)
], PatientBloc.prototype, "prescripteurId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], PatientBloc.prototype, "chirurgien_nom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PatientStatut, default: PatientStatut.EN_ATTENTE_CPA }),
    __metadata("design:type", String)
], PatientBloc.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: NiveauUrgence, default: NiveauUrgence.NORMAL }),
    __metadata("design:type", String)
], PatientBloc.prototype, "niveauUrgence", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], PatientBloc.prototype, "chambre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], PatientBloc.prototype, "serviceOrigine", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], PatientBloc.prototype, "serviceOrigineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientBloc.prototype, "motifRefusCpa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true, unique: true }),
    __metadata("design:type", Object)
], PatientBloc.prototype, "prescriptionExterneId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PatientBloc.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PatientBloc.prototype, "updatedAt", void 0);
exports.PatientBloc = PatientBloc = __decorate([
    (0, typeorm_1.Entity)('patients_bloc')
], PatientBloc);
//# sourceMappingURL=patient-bloc.entity.js.map