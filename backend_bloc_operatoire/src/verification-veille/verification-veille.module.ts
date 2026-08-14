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
  // ⚠️ L'ORDRE COMPTE. NestJS teste les routes dans l'ordre d'enregistrement des contrôleurs, et
  // « verification-veille/fichiers » est un sous-chemin de « verification-veille ». Enregistré en
  // second, GET /verification-veille/fichiers tombait d'abord sur le @Get(':id') du contrôleur
  // parent, avec id = "fichiers" : son ParseUUIDPipe rejetait la requête avec
  // « Validation failed (uuid is expected) ». La liste des pièces jointes échouait donc
  // systématiquement — au chargement de l'écran comme après chaque import, ce dernier affichant
  // « Erreur d'import » alors que le fichier venait bel et bien d'être enregistré.
  // Le contrôleur le plus spécifique doit être déclaré en premier.
  controllers: [
    FichiersVerificationVeilleController,
    VerificationVeilleController,
  ],
  providers: [VerificationVeilleService, FichiersVerificationVeilleService],
  exports: [VerificationVeilleService, FichiersVerificationVeilleService],
})
export class VerificationVeilleModule {}
