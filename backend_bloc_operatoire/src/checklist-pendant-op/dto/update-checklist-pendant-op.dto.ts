import { PartialType } from '@nestjs/mapped-types';
import { CreateChecklistPendantOpDto } from './create-checklist-pendant-op.dto';
export class UpdateChecklistPendantOpDto extends PartialType(CreateChecklistPendantOpDto) {}
