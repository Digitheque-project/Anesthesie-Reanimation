import { PartialType } from '@nestjs/mapped-types';
import { CreateVerificationVeilleDto } from './create-verification-veille.dto';
export class UpdateVerificationVeilleDto extends PartialType(CreateVerificationVeilleDto) {}
