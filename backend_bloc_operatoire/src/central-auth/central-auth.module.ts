import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CentralAuthGuard } from './central-auth.guard';
import { ServiceTokenService } from './service-token.service';

@Global()
@Module({
  imports: [JwtModule.register({}), ConfigModule],
  providers: [CentralAuthGuard, ServiceTokenService],
  exports: [CentralAuthGuard, ServiceTokenService],
})
export class CentralAuthModule {}
