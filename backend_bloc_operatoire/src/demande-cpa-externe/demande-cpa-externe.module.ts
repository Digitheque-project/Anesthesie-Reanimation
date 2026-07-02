import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { DemandeCpaExterneService } from './demande-cpa-externe.service';
import { DemandeCpaExterneController } from './demande-cpa-externe.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DemandeCpaExterne])],
  controllers: [DemandeCpaExterneController],
  providers: [DemandeCpaExterneService],
  exports: [DemandeCpaExterneService],
})
export class DemandeCpaExterneModule {}
