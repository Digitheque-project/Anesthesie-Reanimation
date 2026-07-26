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
exports.CreateSortieReveilDto = exports.ChecklistSortieReveilDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const sortie_reveil_entity_1 = require("../../entities/sortie-reveil.entity");
class ChecklistSortieReveilDto {
    signesVitauxStables;
    douleurControlee;
    prescriptionsFaites;
    familleInformee;
}
exports.ChecklistSortieReveilDto = ChecklistSortieReveilDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChecklistSortieReveilDto.prototype, "signesVitauxStables", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChecklistSortieReveilDto.prototype, "douleurControlee", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChecklistSortieReveilDto.prototype, "prescriptionsFaites", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChecklistSortieReveilDto.prototype, "familleInformee", void 0);
class CreateSortieReveilDto {
    patientId;
    scoreSCCREId;
    medecinId;
    dateHeureSortie;
    versServiceOrigine;
    autresServicesDestination;
    checklistSortie;
    statut;
}
exports.CreateSortieReveilDto = CreateSortieReveilDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSortieReveilDto.prototype, "patientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSortieReveilDto.prototype, "scoreSCCREId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSortieReveilDto.prototype, "medecinId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSortieReveilDto.prototype, "dateHeureSortie", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSortieReveilDto.prototype, "versServiceOrigine", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateSortieReveilDto.prototype, "autresServicesDestination", void 0);
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ChecklistSortieReveilDto),
    __metadata("design:type", ChecklistSortieReveilDto)
], CreateSortieReveilDto.prototype, "checklistSortie", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(sortie_reveil_entity_1.StatutSortieReveil),
    __metadata("design:type", String)
], CreateSortieReveilDto.prototype, "statut", void 0);
//# sourceMappingURL=create-sortie-reveil.dto.js.map