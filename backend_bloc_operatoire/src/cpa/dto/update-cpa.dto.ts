import { PartialType } from '@nestjs/mapped-types';
import { CreateCPADto } from './create-cpa.dto';
export class UpdateCPADto extends PartialType(CreateCPADto) {}
