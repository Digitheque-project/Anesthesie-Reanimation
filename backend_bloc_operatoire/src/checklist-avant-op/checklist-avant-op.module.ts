import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { ChecklistAvantOpController } from './checklist-avant-op.controller';
import { TracabiliteModule } from '../tracabilite/tracabilite.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChecklistAvantOp]), TracabiliteModule],
  controllers: [ChecklistAvantOpController],
})
export class ChecklistAvantOpModule {}
