import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medecin } from '../entities/medecin.entity';
import { MedecinService } from './medecin.service';
import { MedecinController } from './medecin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Medecin])],
  controllers: [MedecinController],
  providers: [MedecinService],
  exports: [MedecinService],
})
export class MedecinModule {}
