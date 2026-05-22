import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriqueModification } from '../entities/historique-modification.entity';
import { TracabiliteService } from './tracabilite.service';
import { TracabiliteController } from './tracabilite.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HistoriqueModification])],
  controllers: [TracabiliteController],
  providers: [TracabiliteService],
  exports: [TracabiliteService],
})
export class TracabiliteModule {}
