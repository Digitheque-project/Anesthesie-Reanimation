import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentCatalogueEntry } from '../entities/moment-catalogue-entry.entity';
import { MomentsCatalogueController } from './moments-catalogue.controller';
import { MomentsCatalogueService } from './moments-catalogue.service';

@Module({
  imports: [TypeOrmModule.forFeature([MomentCatalogueEntry])],
  controllers: [MomentsCatalogueController],
  providers: [MomentsCatalogueService],
})
export class MomentsCatalogueModule {}
