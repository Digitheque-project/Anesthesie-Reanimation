import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { ScoreSCCREService } from './score-sccre.service';
import { ScoreSCCREController } from './score-sccre.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreSCCRE])],
  controllers: [ScoreSCCREController],
  providers: [ScoreSCCREService],
  exports: [ScoreSCCREService],
})
export class ScoreSCCREModule {}
