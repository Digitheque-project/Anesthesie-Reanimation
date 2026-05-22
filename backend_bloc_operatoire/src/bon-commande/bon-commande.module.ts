import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BonCommandeAnesthesie } from '../entities/bon-commande-anesthesie.entity';
import { ItemCommande } from '../entities/item-commande.entity';
import { BonCommandeService } from './bon-commande.service';
import { BonCommandeController } from './bon-commande.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BonCommandeAnesthesie, ItemCommande])],
  controllers: [BonCommandeController],
  providers: [BonCommandeService],
  exports: [BonCommandeService],
})
export class BonCommandeModule {}
