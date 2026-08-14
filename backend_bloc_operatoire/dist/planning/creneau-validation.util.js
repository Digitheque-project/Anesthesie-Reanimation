"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifierCreneauValide = verifierCreneauValide;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const creneau_bloc_entity_1 = require("../entities/creneau-bloc.entity");
async function verifierCreneauValide(creneauRepo, date, heureDebut, type = creneau_bloc_entity_1.TypeRDV.CPA) {
    if (!date)
        return;
    const aujourdhui = new Date().toISOString().split('T')[0];
    const dateSeule = new Date(date).toISOString().split('T')[0];
    if (dateSeule < aujourdhui) {
        throw new common_1.BadRequestException("Impossible de planifier un rendez-vous à une date passée.");
    }
    if (type === creneau_bloc_entity_1.TypeRDV.VERIFICATION_VEILLE)
        return;
    if (!heureDebut)
        return;
    const conflit = await creneauRepo.findOne({
        where: {
            date: date,
            heureDebut,
            statut: (0, typeorm_1.Not)(creneau_bloc_entity_1.StatutCreneau.ANNULE),
            type: (0, typeorm_1.Not)(creneau_bloc_entity_1.TypeRDV.VERIFICATION_VEILLE),
        },
    });
    if (conflit) {
        throw new common_1.BadRequestException(`Un rendez-vous est déjà planifié le ${dateSeule} à ${heureDebut} — choisissez un autre horaire.`);
    }
}
//# sourceMappingURL=creneau-validation.util.js.map