import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { MedecinModule } from '../medecin/medecin.module';
import { PatientBlocModule } from '../patient-bloc/patient-bloc.module';
import { TracabiliteModule } from '../tracabilite/tracabilite.module';
import { SortieReveilService } from './sortie-reveil.service';
import { SortieReveilController } from './sortie-reveil.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SortieReveil]),
    MedecinModule,
    PatientBlocModule,
    TracabiliteModule,
  ],
  controllers: [SortieReveilController],
  providers: [SortieReveilService],
  exports: [SortieReveilService],
})
export class SortieReveilModule {}
