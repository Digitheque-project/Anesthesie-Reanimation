import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationVeille } from '../entities/verification-veille.entity';
import { CPA } from '../entities/cpa.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { FichierVerificationVeille } from '../entities/fichier-verification-veille.entity';
import { DemandeCpaExterneModule } from '../demande-cpa-externe/demande-cpa-externe.module';
import { PatientBlocModule } from '../patient-bloc/patient-bloc.module';
import { MedecinModule } from '../medecin/medecin.module';
import { TracabiliteModule } from '../tracabilite/tracabilite.module';
import { VerificationVeilleService } from './verification-veille.service';
import { VerificationVeilleController } from './verification-veille.controller';
import { FichiersVerificationVeilleService } from './fichiers-verification-veille.service';
import { FichiersVerificationVeilleController } from './fichiers-verification-veille.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VerificationVeille,
      CPA,
      PatientBloc,
      FichierVerificationVeille,
    ]),
    DemandeCpaExterneModule,
    PatientBlocModule,
    MedecinModule,
    TracabiliteModule,
  ],
  controllers: [
    VerificationVeilleController,
    FichiersVerificationVeilleController,
  ],
  providers: [VerificationVeilleService, FichiersVerificationVeilleService],
  exports: [VerificationVeilleService, FichiersVerificationVeilleService],
})
export class VerificationVeilleModule {}
