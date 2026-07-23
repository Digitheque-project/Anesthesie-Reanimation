"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreSCCREModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const score_sccre_entity_1 = require("../entities/score-sccre.entity");
const medecin_module_1 = require("../medecin/medecin.module");
const score_sccre_service_1 = require("./score-sccre.service");
const score_sccre_controller_1 = require("./score-sccre.controller");
let ScoreSCCREModule = class ScoreSCCREModule {
};
exports.ScoreSCCREModule = ScoreSCCREModule;
exports.ScoreSCCREModule = ScoreSCCREModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([score_sccre_entity_1.ScoreSCCRE]), medecin_module_1.MedecinModule],
        controllers: [score_sccre_controller_1.ScoreSCCREController],
        providers: [score_sccre_service_1.ScoreSCCREService],
        exports: [score_sccre_service_1.ScoreSCCREService],
    })
], ScoreSCCREModule);
//# sourceMappingURL=score-sccre.module.js.map