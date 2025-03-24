import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { translateValidationMessage } from '../common/i18n';

export class EncryptDTO {
  @ApiProperty({ type: 'object', additionalProperties: false })
  @IsNotEmpty({ message: translateValidationMessage('VALIDATION.NOT_EMPTY') })
  data: any;
}

export class DecryptDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: translateValidationMessage('VALIDATION.NOT_EMPTY') })
  @IsString({ message: translateValidationMessage('VALIDATION.NOT_STRING') })
  data: string;
}
