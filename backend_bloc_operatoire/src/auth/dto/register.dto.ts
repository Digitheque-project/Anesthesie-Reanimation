import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../roles.enum';

export class RegisterDto {
  @IsString() @MinLength(2) @MaxLength(100)
  nom: string;

  @IsEmail()
  email: string;

  @IsString() @MinLength(6)
  motDePasse: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
