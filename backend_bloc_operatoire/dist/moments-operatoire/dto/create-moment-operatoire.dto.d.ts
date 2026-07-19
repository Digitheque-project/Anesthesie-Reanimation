import { CategorieMoment } from '../../entities/moment-operatoire.entity';
export declare class CreateMomentOperatoireDto {
    patientId: string;
    label: string;
    categorie: CategorieMoment;
    estPersonnalise?: boolean;
    horodatage: string;
}
