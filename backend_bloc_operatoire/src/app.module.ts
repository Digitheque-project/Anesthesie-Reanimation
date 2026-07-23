import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientBlocModule } from './patient-bloc/patient-bloc.module';
import { MedecinModule } from './medecin/medecin.module';
import { CPAModule } from './cpa/cpa.module';
import { VerificationVeilleModule } from './verification-veille/verification-veille.module';
import { BonCommandeModule } from './bon-commande/bon-commande.module';
import { ActivitePerOpModule } from './activite-per-op/activite-per-op.module';
import { ProtocoleOperatoireModule } from './protocole-operatoire/protocole-operatoire.module';
import { ScoreSCCREModule } from './score-sccre/score-sccre.module';
import { SortieReveilModule } from './sortie-reveil/sortie-reveil.module';
import { NotificationCPAModule } from './notification-cpa/notification-cpa.module';
import { AuthModule } from './auth/auth.module';
import { ArchivesModule } from './archives/archives.module';
import { RapportsModule } from './rapports/rapports.module';
import { PlanningModule } from './planning/planning.module';
import { TracabiliteModule } from './tracabilite/tracabilite.module';
import { ExportsModule } from './exports/exports.module';
import { ChecklistAvantOpModule } from './checklist-avant-op/checklist-avant-op.module';
import { ChecklistPendantOpModule } from './checklist-pendant-op/checklist-pendant-op.module';
import { ChecklistApresOpModule } from './checklist-apres-op/checklist-apres-op.module';
import { WebhookNotificationModule } from './webhook-notification/webhook-notification.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { PrescriptionImagerieModule } from './prescription-imagerie/prescription-imagerie.module';
import { DemandeCpaExterneModule } from './demande-cpa-externe/demande-cpa-externe.module';
import { ExternalModule } from './external/external.module';
import { CentralAuthModule } from './central-auth/central-auth.module';
import { CentralAuthGuard } from './central-auth/central-auth.guard';
import { OperationGatewayModule } from './operation-gateway/operation-gateway.module';
import { MomentsOperatoireModule } from './moments-operatoire/moments-operatoire.module';
import { MomentsCatalogueModule } from './moments-catalogue/moments-catalogue.module';
import externalServicesConfig from './config/external-services.config';
import centralAuthConfig from './config/central-auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [externalServicesConfig, centralAuthConfig] }),
    ScheduleModule.forRoot(),
    ExternalModule,
    CentralAuthModule,
    OperationGatewayModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    PatientBlocModule,
    MedecinModule,
    CPAModule,
    VerificationVeilleModule,
    BonCommandeModule,
    ActivitePerOpModule,
    ProtocoleOperatoireModule,
    ScoreSCCREModule,
    SortieReveilModule,
    NotificationCPAModule,
    AuthModule,
    ArchivesModule,
    RapportsModule,
    PlanningModule,
    TracabiliteModule,
    ExportsModule,
    ChecklistAvantOpModule,
    ChecklistPendantOpModule,
    ChecklistApresOpModule,
    MomentsOperatoireModule,
    MomentsCatalogueModule,
    WebhookNotificationModule,
    PrescriptionModule,
    PrescriptionImagerieModule,
    DemandeCpaExterneModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: CentralAuthGuard }],
})
export class AppModule {}
