import { IsEnum, IsString, MinLength } from 'class-validator';
import { CategorieMoment } from '../../entities/moment-operatoire.entity';

export class CreateMomentCatalogueEntryDto {
  @IsEnum(CategorieMoment) categorie: CategorieMoment;
  @IsString() @MinLength(2) label: string;
}
