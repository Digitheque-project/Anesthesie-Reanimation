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
exports.FichiersVerificationVeilleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fichier_verification_veille_entity_1 = require("../entities/fichier-verification-veille.entity");
function sansContenu(fichier) {
    return {
        id: fichier.id,
        patientId: fichier.patientId,
        verificationVeilleId: fichier.verificationVeilleId,
        nomOriginal: fichier.nomOriginal,
        mimeType: fichier.mimeType,
        tailleOctets: fichier.tailleOctets,
        telechargeParId: fichier.telechargeParId,
        createdAt: fichier.createdAt,
    };
}
let FichiersVerificationVeilleService = class FichiersVerificationVeilleService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async upload(fichier, patientId, utilisateurId) {
        if (!fichier || !fichier.buffer || fichier.buffer.length === 0) {
            throw new common_1.BadRequestException('Fichier vide ou invalide.');
        }
        const saved = await this.repo.save(this.repo.create({
            patientId,
            nomOriginal: fichier.originalname || 'fichier',
            mimeType: fichier.mimetype || 'application/octet-stream',
            tailleOctets: fichier.size || fichier.buffer.length,
            contenu: fichier.buffer,
            telechargeParId: utilisateurId ?? null,
        }));
        return sansContenu(saved);
    }
    async listerParPatient(patientId) {
        if (!patientId) {
            throw new common_1.BadRequestException('patientId requis.');
        }
        const fichiers = await this.repo.find({
            where: { patientId },
            order: { createdAt: 'DESC' },
        });
        return fichiers.map(sansContenu);
    }
    async trouverAvecContenu(id) {
        const fichier = await this.repo.findOne({ where: { id } });
        if (!fichier) {
            throw new common_1.NotFoundException(`Pièce jointe ${id} introuvable.`);
        }
        return fichier;
    }
    async supprimer(id) {
        const fichier = await this.repo.findOne({ where: { id } });
        if (!fichier) {
            throw new common_1.NotFoundException(`Pièce jointe ${id} introuvable.`);
        }
        await this.repo.delete(id);
        return { message: 'Pièce jointe supprimée.' };
    }
    async rattacher(patientId, verificationVeilleId) {
        const resultat = await this.repo.update({ patientId, verificationVeilleId: (0, typeorm_2.IsNull)() }, { verificationVeilleId });
        return resultat.affected ?? 0;
    }
};
exports.FichiersVerificationVeilleService = FichiersVerificationVeilleService;
exports.FichiersVerificationVeilleService = FichiersVerificationVeilleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fichier_verification_veille_entity_1.FichierVerificationVeille)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FichiersVerificationVeilleService);
//# sourceMappingURL=fichiers-verification-veille.service.js.map