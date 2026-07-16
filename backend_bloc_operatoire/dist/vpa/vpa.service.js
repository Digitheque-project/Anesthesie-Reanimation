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
exports.VPAService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vpa_entity_1 = require("../entities/vpa.entity");
const cpa_entity_1 = require("../entities/cpa.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const accueil_client_1 = require("../external/accueil.client");
const endoscopie_client_1 = require("../external/endoscopie.client");
const demande_cpa_externe_service_1 = require("../demande-cpa-externe/demande-cpa-externe.service");
let VPAService = class VPAService {
    repo;
    patientBlocRepo;
    cpaRepo;
    accueilClient;
    endoscopieClient;
    demandeCpaExterneService;
    constructor(repo, patientBlocRepo, cpaRepo, accueilClient, endoscopieClient, demandeCpaExterneService) {
        this.repo = repo;
        this.patientBlocRepo = patientBlocRepo;
        this.cpaRepo = cpaRepo;
        this.accueilClient = accueilClient;
        this.endoscopieClient = endoscopieClient;
        this.demandeCpaExterneService = demandeCpaExterneService;
    }
    async create(dto) {
        if (dto.patientId) {
            const patient = await this.patientBlocRepo.findOne({ where: { patientId: dto.patientId } });
            if (patient) {
                const estPatientUrgent = patient.niveauUrgence === 'STAT' || patient.niveauUrgence === 'URGENT';
                if (!estPatientUrgent && !dto.cpaId) {
                    throw new common_1.BadRequestException('CPA required before VPA for a normal patient.');
                }
                if (dto.cpaId) {
                    const cpa = await this.cpaRepo.findOne({ where: { id: dto.cpaId, patientId: dto.patientId } });
                    if (!cpa) {
                        throw new common_1.BadRequestException('The specified CPA does not belong to this patient.');
                    }
                }
            }
        }
        const savedResult = await this.repo.save(this.repo.create(dto));
        const saved = Array.isArray(savedResult) ? savedResult[0] : savedResult;
        if (dto.patientId) {
            await this.patientBlocRepo.update(dto.patientId, { statut: patient_bloc_entity_1.PatientStatut.VPA_REALISE });
            const demande = await this.demandeCpaExterneService.trouverDemandeOuverte(dto.patientId);
            if (demande) {
                await this.demandeCpaExterneService.marquerVpaRealisee(demande, saved.id);
                await this.endoscopieClient.notifyVpaRealisee(demande, { dateVpa: saved.dateVisite });
            }
        }
        return saved;
    }
    async findAll(page = 1, limite = 10) {
        const [data, total] = await this.repo.findAndCount({
            relations: ['cpa', 'anesthesiste'],
            skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' }
        });
        const enriched = await this.accueilClient.enrichWithIdentity(data);
        return { data: enriched, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(id) {
        const vpa = await this.repo.findOne({ where: { id }, relations: ['cpa', 'anesthesiste'] });
        if (!vpa)
            throw new common_1.NotFoundException(`VPA ${id} non trouvée`);
        const [enriched] = await this.accueilClient.enrichWithIdentity([vpa]);
        return enriched;
    }
    async update(id, dto) {
        const vpa = await this.repo.findOne({ where: { id } });
        if (!vpa)
            throw new common_1.NotFoundException(`VPA ${id} non trouvée`);
        return this.repo.save(Object.assign(vpa, dto));
    }
    async remove(id) {
        const vpa = await this.repo.findOne({ where: { id } });
        if (!vpa)
            throw new common_1.NotFoundException(`VPA ${id} non trouvée`);
        await this.repo.delete(id);
        return { message: 'VPA supprimée' };
    }
};
exports.VPAService = VPAService;
exports.VPAService = VPAService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vpa_entity_1.VPA)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __param(2, (0, typeorm_1.InjectRepository)(cpa_entity_1.CPA)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        endoscopie_client_1.EndoscopieClient,
        demande_cpa_externe_service_1.DemandeCpaExterneService])
], VPAService);
//# sourceMappingURL=vpa.service.js.map