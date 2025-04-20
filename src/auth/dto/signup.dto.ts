import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { translateValidationMessage } from '../../common/i18n';

export class SignupDTO {
  @ApiProperty({ required: true })
  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty({ message: translateValidationMessage('VALIDATION.NOT_EMPTY') })
  @IsEmail(
    {},
    { message: translateValidationMessage('VALIDATION.INVALID_EMAIL') },
  )
  email!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: translateValidationMessage('VALIDATION.NOT_EMPTY') })
  @IsStrongPassword(
    {},
    { message: translateValidationMessage('VALIDATION.WEAK_PASSWORD') },
  )
  @IsString({ message: translateValidationMessage('VALIDATION.NOT_STRING') })
  password!: string;
}
