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
exports.PatientBlocService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const demande_cpa_externe_entity_1 = require("../entities/demande-cpa-externe.entity");
const accueil_client_1 = require("../external/accueil.client");
const dossier_patient_client_1 = require("../external/dossier-patient.client");
const protocole_operatoire_service_1 = require("../protocole-operatoire/protocole-operatoire.service");
let PatientBlocService = class PatientBlocService {
    patientRepo;
    demandeRepo;
    accueilClient;
    dossierPatientClient;
    protocoleOperatoireService;
    config;
    constructor(patientRepo, demandeRepo, accueilClient, dossierPatientClient, protocoleOperatoireService, config) {
        this.patientRepo = patientRepo;
        this.demandeRepo = demandeRepo;
        this.accueilClient = accueilClient;
        this.dossierPatientClient = dossierPatientClient;
        this.protocoleOperatoireService = protocoleOperatoireService;
        this.config = config;
    }
    async creerDepuisPrescription(demandeId) {
        const demande = await this.demandeRepo.findOne({
            where: { id: demandeId },
        });
        if (!demande)
            throw new Error('Demande non trouvée');
        const estUrgence = demande.urgence !== undefined && demande.urgence >= 3;
        const niveauUrgence = estUrgence
            ? patient_bloc_entity_1.NiveauUrgence.TRES_URGENT
            : patient_bloc_entity_1.NiveauUrgence.NORMAL;
        const patient = new patient_bloc_entity_1.PatientBloc();
        patient.patientId = demande.patientId;
        patient.chuId = demande.chuId;
        patient.idDossier = `CHU-${Date.now()}`;
        patient.groupeSanguin = 'A+';
        patient.niveauUrgence = niveauUrgence;
        patient.statut = patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA;
        patient.prescripteurId = demande.sourceServiceId;
        patient.serviceOrigine = demande.sourceServiceName || null;
        patient.serviceOrigineId = demande.sourceServiceId || null;
        const saved = await this.patientRepo.save(patient);
        return Array.isArray(saved) ? saved[0] : saved;
    }
    estStat(patientId) {
        return false;
    }
    async findAll(filters) {
        const { statut, niveauUrgence, recherche, page = 1, limite = 10 } = filters;
        const qb = this.patientRepo.createQueryBuilder('p');
        if (statut)
            qb.andWhere('p.statut = :statut', { statut });
        if (niveauUrgence)
            qb.andWhere('p.niveauUrgence = :niveauUrgence', { niveauUrgence });
        if (recherche)
            qb.andWhere('p.idDossier ILIKE :recherche', {
                recherche: `%${recherche}%`,
            });
        qb.orderBy('p.createdAt', 'DESC');
        qb.skip((page - 1) * limite).take(limite);
        const [data, total] = await qb.getManyAndCount();
        let enriched = data;
        try {
            enriched = await this.accueilClient.enrichWithIdentity(data);
        }
        catch {
        }
        return { data: enriched, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(patientId) {
        const patient = await this.patientRepo.findOne({ where: { patientId } });
        if (!patient)
            return null;
        try {
            return await this.accueilClient.enrichWithIdentity(patient);
        }
        catch {
            return patient;
        }
    }
    async getDossierMedical(patientId, token) {
        const [antecedents, diagnostics, histoireMaladie, alertesUrgentes, dernierExamen, examensComplementaires, suivis,] = await Promise.all([
            this.dossierPatientClient.getAntecedentsActifs(patientId, token),
            this.dossierPatientClient.getDiagnostics(patientId, token),
            this.dossierPatientClient.getHistoriqueMaladieRecente(patientId, token),
            this.dossierPatientClient.getHistoriquesUrgents(patientId, token),
            this.dossierPatientClient.getDernierExamenPhysique(patientId, token),
            this.dossierPatientClient.getExamensComplementairesUrgents(patientId, token),
            this.dossierPatientClient.getSuivis(patientId, token),
        ]);
        return {
            antecedents,
            diagnostics,
            histoireMaladie,
            alertesUrgentes,
            dernierExamen,
            examensComplementaires,
            suivis,
        };
    }
    async getDossierComplet(patientId, token) {
        const [observations, diagnostics, antecedents, histoiresMaladie, examensPhysiques, examensComplementaires, suivis, protocolesOperatoires,] = await Promise.all([
            this.dossierPatientClient.getObservations(patientId, token),
            this.dossierPatientClient.getDiagnosticsTous(patientId, token),
            this.dossierPatientClient.getAntecedentsTous(patientId, token),
            this.dossierPatientClient.getHistoiresMaladie(patientId, token),
            this.dossierPatientClient.getExamensPhysiquesTous(patientId, token),
            this.dossierPatientClient.getExamensComplementairesTous(patientId, token),
            this.dossierPatientClient.getSuivis(patientId, token),
            this.protocoleOperatoireService
                .findAll(1, 50, patientId)
                .then((r) => r.data)
                .catch(() => []),
        ]);
        const episodeId = diagnostics.find((d) => d.episodeId)?.episodeId;
        const sortie = episodeId
            ? await this.dossierPatientClient.getSortieMedicale(episodeId, token)
            : [];
        return {
            observations,
            diagnostics,
            antecedents,
            histoiresMaladie,
            examensPhysiques,
            examensComplementaires,
            suivis,
            protocolesOperatoires,
            sortie,
        };
    }
    async update(patientId, dto) {
        const patient = await this.patientRepo.findOne({ where: { patientId } });
        if (!patient)
            throw new Error('Patient non trouvé');
        Object.assign(patient, dto);
        const saved = await this.patientRepo.save(patient);
        return Array.isArray(saved) ? saved[0] : saved;
    }
    async remove(patientId) {
        await this.patientRepo.delete(patientId);
        return { message: 'Patient supprimé du bloc' };
    }
    async search(q) {
        return [];
    }
    async getExternal(externalId) {
        return null;
    }
    async admitExisting(dto) {
        const patient = this.patientRepo.create({
            ...dto,
            chuId: dto.chuId || this.config.get('externalServices.chuId'),
            statut: patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA,
            niveauUrgence: dto.niveauUrgence || patient_bloc_entity_1.NiveauUrgence.NORMAL,
        });
        const saved = await this.patientRepo.save(patient);
        return Array.isArray(saved) ? saved[0] : saved;
    }
    async registerAndAdmit(dto, createdBy) {
        const patient = this.patientRepo.create({
            ...dto,
            chuId: dto.chuId || this.config.get('externalServices.chuId'),
            statut: patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA,
            niveauUrgence: dto.niveauUrgence || patient_bloc_entity_1.NiveauUrgence.NORMAL,
        });
        const saved = await this.patientRepo.save(patient);
        return Array.isArray(saved) ? saved[0] : saved;
    }
};
exports.PatientBlocService = PatientBlocService;
exports.PatientBlocService = PatientBlocService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __param(1, (0, typeorm_1.InjectRepository)(demande_cpa_externe_entity_1.DemandeCpaExterne)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        dossier_patient_client_1.DossierPatientClient,
        protocole_operatoire_service_1.ProtocoleOperatoireService,
        config_1.ConfigService])
], PatientBlocService);
//# sourceMappingURL=patient-bloc.service.js.map