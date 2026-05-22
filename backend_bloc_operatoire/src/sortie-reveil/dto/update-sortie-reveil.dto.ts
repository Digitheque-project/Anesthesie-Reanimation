import { PartialType } from '@nestjs/mapped-types';
import { CreateSortieReveilDto } from './create-sortie-reveil.dto';
export class UpdateSortieReveilDto extends PartialType(CreateSortieReveilDto) {}
