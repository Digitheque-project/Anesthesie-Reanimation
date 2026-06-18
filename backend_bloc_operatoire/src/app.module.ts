import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientModule } from './patient/patient.module';
import { MedecinModule } from './medecin/medecin.module';
import { CPAModule } from './cpa/cpa.module';
import { VPAModule } from './vpa/vpa.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    PatientModule,
    MedecinModule,
    CPAModule,
    VPAModule,
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
    WebhookNotificationModule,
    PrescriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
