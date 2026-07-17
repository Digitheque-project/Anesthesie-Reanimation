import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { DemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { CreneauBloc } from '../entities/creneau-bloc.entity';
import { DemandeCpaExterneService } from './demande-cpa-externe.service';
import { DemandeCpaExterneController } from './demande-cpa-externe.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DemandeCpaExterne, CreneauBloc]), HttpModule.register({ timeout: 45000 })],
  controllers: [DemandeCpaExterneController],
  providers: [DemandeCpaExterneService],
  exports: [DemandeCpaExterneService],
})
export class DemandeCpaExterneModule {}
