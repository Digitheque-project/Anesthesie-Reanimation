import { IsString, IsEnum, IsDateString, IsBoolean, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StatutBonCommande } from '../../entities/bon-commande-anesthesie.entity';

class ItemDto {
  @IsString() nom: string;
  @IsBoolean() selectionne: boolean;
  @IsOptional() @IsString() quantite?: string;
  @IsOptional() @IsString() dosage?: string;
  @IsOptional() @IsString() observation?: string;
}

export class CreateBonCommandeDto {
  @IsString() patientId: string;
  @IsOptional() @IsString() verificationVeilleId?: string;
  @IsOptional() @IsString() chirurgienId?: string;
  @IsOptional() @IsString() anesthesisteId?: string;
  @IsDateString() dateCreation: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ItemDto) items?: ItemDto[];
  @IsOptional() @IsArray() @IsString({ each: true }) consommables?: string[];
  @IsOptional() @IsEnum(StatutBonCommande) statut?: StatutBonCommande;
}
