import { PartialType } from '@nestjs/mapped-types';
import { CreateVPADto } from './create-vpa.dto';
export class UpdateVPADto extends PartialType(CreateVPADto) {}
