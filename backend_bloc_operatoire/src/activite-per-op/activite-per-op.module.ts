import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ConstantePerOp } from '../entities/constante-per-op.entity';
import { ActivitePerOpService } from './activite-per-op.service';
import { ActivitePerOpController } from './activite-per-op.controller';
import { OperationGatewayModule } from '../operation-gateway/operation-gateway.module';
import { MedecinModule } from '../medecin/medecin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivitePerOp, ConstantePerOp]),
    OperationGatewayModule,
    MedecinModule,
  ],
  controllers: [ActivitePerOpController],
  providers: [ActivitePerOpService],
  exports: [ActivitePerOpService],
})
export class ActivitePerOpModule {}
