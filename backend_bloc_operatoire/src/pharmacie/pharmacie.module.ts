import { Module } from '@nestjs/common';
import { PharmacieController } from './pharmacie.controller';

@Module({
  controllers: [PharmacieController],
})
export class PharmacieModule {}
