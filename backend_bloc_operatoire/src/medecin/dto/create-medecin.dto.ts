import { IsString, IsEnum, IsEmail, Length } from 'class-validator';
import { RoleMedecin, OrdreProfessionnel } from '../../entities/medecin.entity';

export class CreateMedecinDto {
  @IsString()
  @Length(2, 100)
  nom: string;

  @IsString()
  @Length(2, 100)
  prenom: string;

  @IsString()
  @Length(2, 10)
  initiales: string;

  @IsEnum(RoleMedecin)
  role: RoleMedecin;

  @IsString()
  @Length(5, 50)
  numeroOrdre: string;

  @IsEnum(OrdreProfessionnel)
  ordre: OrdreProfessionnel;

  @IsString()
  @Length(8, 20)
  telephone: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 50)
  matricule: string;
}
