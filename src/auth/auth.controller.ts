import { Body, Controller, Inject, Post } from '@nestjs/common';
import { BaseController } from '../common';
import { AuthService } from './auth.service';
import { SigninDTO, SignupDTO } from './dto';

@Controller('auth')
export class AuthController extends BaseController {
  @Inject(AuthService) private readonly authService: AuthService | undefined;

  @Post('sign-up')
  async signup(@Body() form: SignupDTO) {
    return this.handleAuthRequest(
      this.authService?.signup.bind(this.authService),
      form,
    );
  }

  @Post('sign-in')
  async signin(@Body() form: SigninDTO) {
    return this.handleAuthRequest(
      this.authService?.signin.bind(this.authService),
      form,
    );
  }
}
