import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VPA } from '../entities/vpa.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { DemandeCpaExterneModule } from '../demande-cpa-externe/demande-cpa-externe.module';
import { VPAService } from './vpa.service';
import { VPAController } from './vpa.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VPA, PatientBloc]), DemandeCpaExterneModule],
  controllers: [VPAController],
  providers: [VPAService],
  exports: [VPAService],
})
export class VPAModule {}
