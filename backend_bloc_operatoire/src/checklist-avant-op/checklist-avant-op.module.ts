import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { ChecklistAvantOpController } from './checklist-avant-op.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChecklistAvantOp])],
  controllers: [ChecklistAvantOpController],
})
export class ChecklistAvantOpModule {}
