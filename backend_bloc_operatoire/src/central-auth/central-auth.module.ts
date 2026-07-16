import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CentralAuthGuard } from './central-auth.guard';

@Global()
@Module({
  imports: [JwtModule.register({}), ConfigModule],
  providers: [CentralAuthGuard],
  exports: [CentralAuthGuard],
})
export class CentralAuthModule {}
