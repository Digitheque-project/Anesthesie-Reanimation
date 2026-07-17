import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationVeille } from '../entities/verification-veille.entity';
import { CPA } from '../entities/cpa.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { DemandeCpaExterneModule } from '../demande-cpa-externe/demande-cpa-externe.module';
import { VerificationVeilleService } from './verification-veille.service';
import { VerificationVeilleController } from './verification-veille.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationVeille, CPA, PatientBloc]), DemandeCpaExterneModule],
  controllers: [VerificationVeilleController],
  providers: [VerificationVeilleService],
  exports: [VerificationVeilleService],
})
export class VerificationVeilleModule {}
