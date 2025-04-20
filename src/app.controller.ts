import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AppService } from './app.service';
import { BaseController } from './common';
import { UnEncrypted } from './common/guards';
import { translateValidationMessage } from './common/i18n';

export class EncryptDTO {
  @ApiProperty({ type: 'object', additionalProperties: false })
  @IsNotEmpty({ message: translateValidationMessage('VALIDATION.NOT_EMPTY') })
  data: any;
}

export class DecryptDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: translateValidationMessage('VALIDATION.NOT_EMPTY') })
  @IsString({ message: translateValidationMessage('VALIDATION.NOT_STRING') })
  data!: string;
}

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
