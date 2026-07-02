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
exports.PlanningService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const creneau_bloc_entity_1 = require("../entities/creneau-bloc.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const accueil_client_1 = require("../external/accueil.client");
let PlanningService = class PlanningService {
    creneauRepo;
    patientBlocRepo;
    accueilClient;
    constructor(creneauRepo, patientBlocRepo, accueilClient) {
        this.creneauRepo = creneauRepo;
        this.patientBlocRepo = patientBlocRepo;
        this.accueilClient = accueilClient;
    }
    async getPlanningJour(jour, type) {
        const qb = this.creneauRepo.createQueryBuilder('c')
            .leftJoinAndSelect('c.chirurgien', 'm')
            .where('c.date = :date', { date: jour })
            .orderBy('c.heureDebut', 'ASC');
        if (type)
            qb.andWhere('c.type = :type', { type });
        const data = await qb.getMany();
        return this.accueilClient.enrichWithIdentity(data);
    }
    async getPlanningSemaine(debut, fin, type) {
        const qb = this.creneauRepo.createQueryBuilder('c')
            .leftJoinAndSelect('c.chirurgien', 'm')
            .where('c.date >= :debut', { debut })
            .andWhere('c.date <= :fin', { fin })
            .orderBy('c.date', 'ASC').addOrderBy('c.heureDebut', 'ASC');
        if (type)
            qb.andWhere('c.type = :type', { type });
        const data = await qb.getMany();
        return this.accueilClient.enrichWithIdentity(data);
    }
    async reserverCreneau(dto) {
        const creneau = this.creneauRepo.create({ ...dto, type: dto.type || creneau_bloc_entity_1.TypeRDV.CPA });
        return this.creneauRepo.save(creneau);
    }
    async annulerCreneau(id) {
        const creneau = await this.creneauRepo.findOne({ where: { id } });
        if (!creneau)
            throw new common_1.NotFoundException('Créneau non trouvé');
        creneau.statut = creneau_bloc_entity_1.StatutCreneau.ANNULE;
        return this.creneauRepo.save(creneau);
    }
    async getUrgencesEnAttente() {
        const data = await this.creneauRepo.find({ where: { estUrgence: true }, relations: ['chirurgien'] });
        return this.accueilClient.enrichWithIdentity(data);
    }
    async transfererCpaVersVpa(dto) {
        const patient = await this.patientBlocRepo.findOne({ where: { patientId: dto.patientId } });
        if (!patient)
            throw new common_1.NotFoundException('Patient non trouvé');
        patient.statut = patient_bloc_entity_1.PatientStatut.EN_ATTENTE_VPA;
        await this.patientBlocRepo.save(patient);
        const creneau = this.creneauRepo.create({
            patientId: dto.patientId,
            chirurgienId: dto.chirurgienId,
            date: dto.dateVPA,
            heureDebut: dto.heureDebut,
            heureFin: dto.heureDebut,
            salle: dto.salle,
            type: creneau_bloc_entity_1.TypeRDV.VPA,
        });
        return this.creneauRepo.save(creneau);
    }
    async transfererVpaVersPatientJour(dto) {
        const patient = await this.patientBlocRepo.findOne({ where: { patientId: dto.patientId } });
        if (!patient)
            throw new common_1.NotFoundException('Patient non trouvé');
        patient.statut = patient_bloc_entity_1.PatientStatut.PRET_POUR_BLOC;
        await this.patientBlocRepo.save(patient);
        const creneau = this.creneauRepo.create({
            patientId: dto.patientId,
            chirurgienId: dto.chirurgienId,
            date: dto.date,
            heureDebut: dto.heureDebut,
            heureFin: dto.heureDebut,
            salle: dto.salle,
            type: creneau_bloc_entity_1.TypeRDV.VPA,
            statut: creneau_bloc_entity_1.StatutCreneau.TERMINE,
        });
        return this.creneauRepo.save(creneau);
    }
};
exports.PlanningService = PlanningService;
exports.PlanningService = PlanningService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(creneau_bloc_entity_1.CreneauBloc)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient])
], PlanningService);
//# sourceMappingURL=planning.service.js.map