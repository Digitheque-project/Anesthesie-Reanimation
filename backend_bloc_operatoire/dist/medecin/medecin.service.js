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
exports.MedecinService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const medecin_entity_1 = require("../entities/medecin.entity");
let MedecinService = class MedecinService {
    medecinRepository;
    constructor(medecinRepository) {
        this.medecinRepository = medecinRepository;
    }
    async create(createMedecinDto) {
        const medecin = this.medecinRepository.create(createMedecinDto);
        return this.medecinRepository.save(medecin);
    }
    async findAll(filters) {
        const { role, recherche, page = 1, limite = 10 } = filters || {};
        const skip = (page - 1) * limite;
        let where = {};
        if (role) {
            where = { ...where, role: role };
        }
        if (recherche) {
            where = [
                { ...where, nom: (0, typeorm_2.Like)(`%${recherche}%`) },
                { ...where, prenom: (0, typeorm_2.Like)(`%${recherche}%`) },
                { ...where, matricule: (0, typeorm_2.Like)(`%${recherche}%`) },
            ];
        }
        const [data, total] = await this.medecinRepository.findAndCount({
            where,
            skip,
            take: limite,
            order: { createdAt: 'DESC' },
        });
        return { data, total, page, pages: Math.ceil(total / limite) };
    }
    async findByEmail(email) {
        if (!email)
            return null;
        return this.medecinRepository.findOne({ where: { email } });
    }
    async findOne(id) {
        const medecin = await this.medecinRepository.findOne({ where: { id } });
        if (!medecin) {
            throw new common_1.NotFoundException(`Médecin avec l'ID ${id} non trouvé`);
        }
        return medecin;
    }
    async update(id, updateMedecinDto) {
        const medecin = await this.findOne(id);
        Object.assign(medecin, updateMedecinDto);
        return this.medecinRepository.save(medecin);
    }
    async remove(id) {
        const medecin = await this.findOne(id);
        await this.medecinRepository.remove(medecin);
        return { message: 'Médecin supprimé avec succès' };
    }
};
exports.MedecinService = MedecinService;
exports.MedecinService = MedecinService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medecin_entity_1.Medecin)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MedecinService);
//# sourceMappingURL=medecin.service.js.map