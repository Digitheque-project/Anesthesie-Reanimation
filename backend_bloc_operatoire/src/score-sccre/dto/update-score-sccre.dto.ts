import { PartialType } from '@nestjs/mapped-types';
import { CreateScoreSCCREDto } from './create-score-sccre.dto';
export class UpdateScoreSCCREDto extends PartialType(CreateScoreSCCREDto) {}
