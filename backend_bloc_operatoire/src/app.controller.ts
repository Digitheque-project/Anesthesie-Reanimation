import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './central-auth/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  getTest(@Req() req: any) {
    return { message: 'OK', user: req.centralUser };
  }
}
