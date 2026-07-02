"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePatientBlocDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const admit_existing_patient_dto_1 = require("./admit-existing-patient.dto");
class UpdatePatientBlocDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.OmitType)(admit_existing_patient_dto_1.AdmitExistingPatientDto, ['patientId'])) {
}
exports.UpdatePatientBlocDto = UpdatePatientBlocDto;
//# sourceMappingURL=update-patient-bloc.dto.js.map