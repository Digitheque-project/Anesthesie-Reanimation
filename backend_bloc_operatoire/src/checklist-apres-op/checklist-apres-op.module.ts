import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';
import { ChecklistApresOpController } from './checklist-apres-op.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChecklistApresOp])],
  controllers: [ChecklistApresOpController],
})
export class ChecklistApresOpModule {}
