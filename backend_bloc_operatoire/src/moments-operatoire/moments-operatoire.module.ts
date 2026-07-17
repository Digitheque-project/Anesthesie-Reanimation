import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentOperatoire } from '../entities/moment-operatoire.entity';
import { MomentsOperatoireController } from './moments-operatoire.controller';
import { MomentsOperatoireService } from './moments-operatoire.service';
import { OperationGatewayModule } from '../operation-gateway/operation-gateway.module';

@Module({
  imports: [TypeOrmModule.forFeature([MomentOperatoire]), OperationGatewayModule],
  controllers: [MomentsOperatoireController],
  providers: [MomentsOperatoireService],
})
export class MomentsOperatoireModule {}
