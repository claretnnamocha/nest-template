import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { BaseController } from './common';
import { UnEncrypted } from './common/guards';
import { DecryptDTO, EncryptDTO } from './dto';

@UnEncrypted()
@Controller()
export class AppController extends BaseController {
  @Inject(AppService)
  private readonly appService!: AppService;

  @Get('health')
  health() {
    return this.handleAuthRequest(this.appService.health.bind(this.appService));
  }

  @Post('encrypt')
  async encrypt(@Body() body: EncryptDTO) {
    const data: any = await this.appService.encrypt(body);
    return { data };
  }

  @Post('decrypt')
  async decrypt(@Body() body: DecryptDTO) {
    const data: any = await this.appService.decrypt(body);
    return data;
  }
}
