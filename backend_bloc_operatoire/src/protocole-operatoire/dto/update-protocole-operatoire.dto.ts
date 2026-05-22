import { PartialType } from '@nestjs/mapped-types';
import { CreateProtocoleOperatoireDto } from './create-protocole-operatoire.dto';
export class UpdateProtocoleOperatoireDto extends PartialType(CreateProtocoleOperatoireDto) {}
