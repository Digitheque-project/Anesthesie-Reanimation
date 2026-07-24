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
var VerificationVeilleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationVeilleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const verification_veille_entity_1 = require("../entities/verification-veille.entity");
const cpa_entity_1 = require("../entities/cpa.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const accueil_client_1 = require("../external/accueil.client");
const endoscopie_client_1 = require("../external/endoscopie.client");
const medecin_identite_service_1 = require("../medecin/medecin-identite.service");
const demande_cpa_externe_service_1 = require("../demande-cpa-externe/demande-cpa-externe.service");
const patient_bloc_statut_service_1 = require("../patient-bloc/patient-bloc-statut.service");
let VerificationVeilleService = VerificationVeilleService_1 = class VerificationVeilleService {
    repo;
    patientBlocRepo;
    cpaRepo;
    accueilClient;
    endoscopieClient;
    medecinIdentiteService;
    demandeCpaExterneService;
    patientBlocStatutService;
    logger = new common_1.Logger(VerificationVeilleService_1.name);
    constructor(repo, patientBlocRepo, cpaRepo, accueilClient, endoscopieClient, medecinIdentiteService, demandeCpaExterneService, patientBlocStatutService) {
        this.repo = repo;
        this.patientBlocRepo = patientBlocRepo;
        this.cpaRepo = cpaRepo;
        this.accueilClient = accueilClient;
        this.endoscopieClient = endoscopieClient;
        this.medecinIdentiteService = medecinIdentiteService;
        this.demandeCpaExterneService = demandeCpaExterneService;
        this.patientBlocStatutService = patientBlocStatutService;
    }
    async create(dto) {
        const cpa = await this.cpaRepo.findOne({ where: { id: dto.cpaId, patientId: dto.patientId } });
        if (!cpa) {
            throw new common_1.BadRequestException("La CPA indiquée n'existe pas pour ce patient.");
        }
        const savedResult = await this.repo.save(this.repo.create(dto));
        const saved = Array.isArray(savedResult) ? savedResult[0] : savedResult;
        await this.patientBlocRepo.update(dto.patientId, { statut: patient_bloc_entity_1.PatientStatut.VERIFICATION_VEILLE_REALISEE });
        try {
            await this.patientBlocStatutService.changerStatut(dto.patientId, patient_bloc_entity_1.PatientStatut.PRET_POUR_BLOC);
        }
        catch (err) {
            this.logger.warn(`Transition PRET_POUR_BLOC impossible pour ${dto.patientId}: ${err.message}`);
        }
        const demande = await this.demandeCpaExterneService.trouverDemandeOuverte(dto.patientId);
        if (demande) {
            await this.demandeCpaExterneService.marquerVpaRealisee(demande, saved.id);
            await this.demandeCpaExterneService.notifierResultat(demande, 'VPA_REALISEE', { dateVpa: saved.dateVisite });
            if (!demande.sourceCallbackUrl) {
                await this.endoscopieClient.notifyVpaRealisee(demande, { dateVpa: saved.dateVisite });
            }
        }
        return saved;
    }
    async findAll(page = 1, limite = 10) {
        const [data, total] = await this.repo.findAndCount({
            relations: ['cpa'],
            skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' }
        });
        const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
        const enriched = await this.medecinIdentiteService.enrichir(enrichedPatient, 'anesthesisteId', 'anesthesiste');
        return { data: enriched, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(id) {
        const verif = await this.repo.findOne({ where: { id }, relations: ['cpa'] });
        if (!verif)
            throw new common_1.NotFoundException(`Vérification veille ${id} non trouvée`);
        const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([verif]);
        const [enriched] = await this.medecinIdentiteService.enrichir([enrichedPatient], 'anesthesisteId', 'anesthesiste');
        return enriched;
    }
    async update(id, dto) {
        const verif = await this.repo.findOne({ where: { id } });
        if (!verif)
            throw new common_1.NotFoundException(`Vérification veille ${id} non trouvée`);
        return this.repo.save(Object.assign(verif, dto));
    }
    async remove(id) {
        const verif = await this.repo.findOne({ where: { id } });
        if (!verif)
            throw new common_1.NotFoundException(`Vérification veille ${id} non trouvée`);
        await this.repo.delete(id);
        return { message: 'Vérification veille supprimée' };
    }
};
exports.VerificationVeilleService = VerificationVeilleService;
exports.VerificationVeilleService = VerificationVeilleService = VerificationVeilleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(verification_veille_entity_1.VerificationVeille)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __param(2, (0, typeorm_1.InjectRepository)(cpa_entity_1.CPA)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        endoscopie_client_1.EndoscopieClient,
        medecin_identite_service_1.MedecinIdentiteService,
        demande_cpa_externe_service_1.DemandeCpaExterneService,
        patient_bloc_statut_service_1.PatientBlocStatutService])
], VerificationVeilleService);
//# sourceMappingURL=verification-veille.service.js.map