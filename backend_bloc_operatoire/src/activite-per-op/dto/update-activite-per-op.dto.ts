import { PartialType } from '@nestjs/mapped-types';
import { CreateActivitePerOpDto } from './create-activite-per-op.dto';
export class UpdateActivitePerOpDto extends PartialType(CreateActivitePerOpDto) {}
