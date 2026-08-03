import { PartialType } from '@nestjs/mapped-types';
import { CreateChecklistAvantOpDto } from './create-checklist-avant-op.dto';

export class UpdateChecklistAvantOpDto extends PartialType(
  CreateChecklistAvantOpDto,
) {}
