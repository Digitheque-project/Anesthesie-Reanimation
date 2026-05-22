import { PartialType } from '@nestjs/mapped-types';
import { CreateBonCommandeDto } from './create-bon-commande.dto';
export class UpdateBonCommandeDto extends PartialType(CreateBonCommandeDto) {}
