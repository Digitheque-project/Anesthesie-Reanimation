import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OperationGateway } from './operation.gateway';

// ConfigService est déjà global (ConfigModule.forRoot({isGlobal:true})). JwtService, lui, n'est
// PAS global malgré CentralAuthModule étant @Global() : ce dernier n'exporte que
// CentralAuthGuard, pas le JwtModule qu'il importe — il faut donc l'importer ici aussi.
// register({}) sans secret est correct : verifyCentralToken passe le secret explicitement à
// chaque verifyAsync(), exactement comme le fait CentralAuthGuard.
@Module({
  imports: [JwtModule.register({})],
  providers: [OperationGateway],
  exports: [OperationGateway],
})
export class OperationGatewayModule {}
