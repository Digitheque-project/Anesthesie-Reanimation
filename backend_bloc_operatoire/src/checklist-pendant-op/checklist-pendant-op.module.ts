import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';
import { ChecklistPendantOpController } from './checklist-pendant-op.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChecklistPendantOp])],
  controllers: [ChecklistPendantOpController],
})
export class ChecklistPendantOpModule {}
