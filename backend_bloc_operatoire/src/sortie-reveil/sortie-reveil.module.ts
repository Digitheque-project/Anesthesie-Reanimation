import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { SortieReveilService } from './sortie-reveil.service';
import { SortieReveilController } from './sortie-reveil.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SortieReveil])],
  controllers: [SortieReveilController],
  providers: [SortieReveilService],
  exports: [SortieReveilService],
})
export class SortieReveilModule {}
