import { IsString, IsDateString, IsBoolean, IsArray, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TypeDrainage, ModeDrainage, CoteDrainage } from '../../entities/drainage.entity';

class DrainageDto {
  @IsEnum(TypeDrainage) type: TypeDrainage;
  @IsEnum(ModeDrainage) mode: ModeDrainage;
  @IsOptional() @IsEnum(CoteDrainage) cote?: CoteDrainage;
}

export class CreateProtocoleOperatoireDto {
  @IsString() patientId: string;
  @IsDateString() dateOperation: string;
  @IsString() chirurgienId: string;
  @IsString() anesthesisteId: string;
  @IsString() infirmiereId: string;
  @IsString() aideOperatoireId: string;
  @IsString() compteRenduIntervention: string;
  @IsOptional() surveillance?: any;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => DrainageDto) drainages?: DrainageDto[];
  @IsOptional() prescriptions?: any;
  @IsBoolean() prescriptionsConjointes: boolean;
}
