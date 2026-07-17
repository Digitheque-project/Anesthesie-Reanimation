import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';
import { ChecklistPendantOpController } from './checklist-pendant-op.controller';
import { ChecklistPendantOpService } from './checklist-pendant-op.service';
import { OperationGatewayModule } from '../operation-gateway/operation-gateway.module';
import { PatientBlocModule } from '../patient-bloc/patient-bloc.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChecklistPendantOp]), OperationGatewayModule, PatientBlocModule],
  controllers: [ChecklistPendantOpController],
  providers: [ChecklistPendantOpService],
})
export class ChecklistPendantOpModule {}
