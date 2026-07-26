import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';
import { ChecklistApresOpController } from './checklist-apres-op.controller';
import { ChecklistApresOpService } from './checklist-apres-op.service';
import { OperationGatewayModule } from '../operation-gateway/operation-gateway.module';
import { PatientBlocModule } from '../patient-bloc/patient-bloc.module';
import { TracabiliteModule } from '../tracabilite/tracabilite.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChecklistApresOp]),
    OperationGatewayModule,
    PatientBlocModule,
    TracabiliteModule,
  ],
  controllers: [ChecklistApresOpController],
  providers: [ChecklistApresOpService],
})
export class ChecklistApresOpModule {}
