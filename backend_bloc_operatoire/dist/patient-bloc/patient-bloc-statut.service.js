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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientBlocStatutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
let PatientBlocStatutService = class PatientBlocStatutService {
    patientBlocRepo;
    constructor(patientBlocRepo) {
        this.patientBlocRepo = patientBlocRepo;
    }
    async changerStatut(patientId, nouveauStatut) {
        const patient = await this.patientBlocRepo.findOne({ where: { patientId } });
        if (!patient)
            throw new Error('Patient non trouvé');
        const transitionsValides = {
            [patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA]: [patient_bloc_entity_1.PatientStatut.CPA_REALISE],
            [patient_bloc_entity_1.PatientStatut.CPA_REALISE]: [patient_bloc_entity_1.PatientStatut.EN_ATTENTE_VPA],
            [patient_bloc_entity_1.PatientStatut.EN_ATTENTE_VPA]: [patient_bloc_entity_1.PatientStatut.VPA_REALISE],
            [patient_bloc_entity_1.PatientStatut.VPA_REALISE]: [patient_bloc_entity_1.PatientStatut.PRET_POUR_BLOC],
            [patient_bloc_entity_1.PatientStatut.PRET_POUR_BLOC]: [patient_bloc_entity_1.PatientStatut.EN_COURS_OPERATION],
            [patient_bloc_entity_1.PatientStatut.EN_COURS_OPERATION]: [patient_bloc_entity_1.PatientStatut.EN_SALLE_REVEIL],
            [patient_bloc_entity_1.PatientStatut.EN_SALLE_REVEIL]: [patient_bloc_entity_1.PatientStatut.SORTI],
            [patient_bloc_entity_1.PatientStatut.SORTI]: [],
        };
        const autorise = transitionsValides[patient.statut]?.includes(nouveauStatut);
        if (!autorise)
            throw new Error(`Transition invalide : ${patient.statut} → ${nouveauStatut}`);
        patient.statut = nouveauStatut;
        return this.patientBlocRepo.save(patient);
    }
};
exports.PatientBlocStatutService = PatientBlocStatutService;
exports.PatientBlocStatutService = PatientBlocStatutService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PatientBlocStatutService);
//# sourceMappingURL=patient-bloc-statut.service.js.map