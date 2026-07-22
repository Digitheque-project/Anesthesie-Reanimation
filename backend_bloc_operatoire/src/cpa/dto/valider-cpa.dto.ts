import { IsString, IsOptional } from 'class-validator';

export class ValiderCPADto {
  @IsOptional() @IsString() commentaireValidation?: string;
}
