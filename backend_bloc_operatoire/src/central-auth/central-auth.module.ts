import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CentralAuthGuard } from './central-auth.guard';
import { ServiceTokenService } from './service-token.service';

@Global()
@Module({
  imports: [JwtModule.register({}), ConfigModule],
  providers: [CentralAuthGuard, ServiceTokenService],
  // JwtModule doit être ré-exporté : AppModule instancie sa propre copie de CentralAuthGuard
  // (APP_GUARD, useClass) et a donc besoin de résoudre JwtService lui-même — jusqu'ici fourni
  // incidemment par l'AuthModule local (supprimé), qui exportait aussi JwtModule sans lien
  // avec ce module-ci.
  exports: [CentralAuthGuard, ServiceTokenService, JwtModule],
})
export class CentralAuthModule {}
