import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { translateValidationMessage } from '../../common/i18n';

export class SigninDTO {
  @ApiProperty({ required: true })
  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty({ message: translateValidationMessage('VALIDATION.NOT_EMPTY') })
  @IsEmail(
    {},
    { message: translateValidationMessage('VALIDATION.INVALID_EMAIL') },
  )
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString({ message: translateValidationMessage('VALIDATION.NOT_STRING') })
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsIP(undefined, {
    message: translateValidationMessage('VALIDATION.INVALID_IP_ADDRESS'),
  })
  ipAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: translateValidationMessage('VALIDATION.NOT_STRING') })
  userAgent?: string;
}
