import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionExterne } from '../entities/ingestion-externe.entity';
import { IngestionLedgerService } from './ingestion-ledger.service';

// Global comme ExternalModule : le journal d'ingestion est utilisé par chaque canal d'arrivée
// (prescription bloc, prescription imagerie, webhook générique), qui n'ont sinon aucune raison de
// se connaître.
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([IngestionExterne])],
  providers: [IngestionLedgerService],
  exports: [IngestionLedgerService],
})
export class IngestionModule {}
