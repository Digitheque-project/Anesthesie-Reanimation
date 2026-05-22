import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtocoleOperatoire } from '../entities/protocole-operatoire.entity';
import { Drainage } from '../entities/drainage.entity';
import { ProtocoleOperatoireService } from './protocole-operatoire.service';
import { ProtocoleOperatoireController } from './protocole-operatoire.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProtocoleOperatoire, Drainage])],
  controllers: [ProtocoleOperatoireController],
  providers: [ProtocoleOperatoireService],
  exports: [ProtocoleOperatoireService],
})
export class ProtocoleOperatoireModule {}
