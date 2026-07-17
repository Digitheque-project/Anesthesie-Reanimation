import { PartialType } from '@nestjs/mapped-types';
import { CreateChecklistApresOpDto } from './create-checklist-apres-op.dto';
export class UpdateChecklistApresOpDto extends PartialType(CreateChecklistApresOpDto) {}
