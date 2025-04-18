import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

// Custom Transform Function
export const TransformToBoolean = Transform(({ value }) =>
  value.toLowerCase() === 'true' ? true : false,
);
export const TransformToLowerCase = Transform(({ value }) =>
  value.toLowerCase(),
);
export const TransformToInt = Transform(({ value }) => Number(value) | 0);
export enum DatabaseDialects {
  postgres = 'postgres',
  mysql = 'mysql',
  oracle = 'oracle',
}

export class BaseEnvConfig {
  @TransformToBoolean
  @IsOptional()
  @IsBoolean()
  ENABLE_DOCUMENTATION = false;

  @TransformToBoolean
  @IsOptional()
  @IsBoolean()
  ENABLE_DEBUG_MODE = false;

  @TransformToBoolean
  @IsOptional()
  @IsBoolean()
  ENABLE_DATABASE = false;

  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  @IsOptional()
  @IsString()
  JWT_SECRET?: string;

  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  @IsArray({})
  ACCEPTED_ORIGINS?: string[];

  @TransformToInt
  @IsNotEmpty()
  @IsNumber()
  PORT: number = 8590;

  // DB Config
  @TransformToLowerCase
  @IsOptional()
  @IsString()
  DATABASE_URL?: string;

  @TransformToBoolean
  @IsOptional()
  @IsBoolean()
  ENABLE_DATABASE_LOGGING = false;

  @TransformToBoolean
  @IsOptional()
  @IsBoolean()
  ENABLE_PAYLOADS_LOGGING = false;

  @TransformToLowerCase
  @IsOptional()
  @IsString()
  DATABASE_DIALECT?: DatabaseDialects = DatabaseDialects.postgres;

  @TransformToBoolean
  @IsOptional()
  @IsBoolean()
  ENABLE_DATABASE_SSL = false;

  // Encryption config
  @TransformToBoolean
  @IsOptional()
  @IsBoolean()
  ENABLE_ENCRYPTED_REQUESTS = false;

  @IsOptional()
  @IsString()
  ENCRYPTION_PRIVATE_KEY?: string;

  @IsOptional()
  @IsString()
  ENCRYPTION_PUBLIC_KEY?: string;

  // Mailing Config
  @IsOptional()
  @IsString()
  NETCORE_API?: string;

  @IsOptional()
  @IsEmail()
  EMAIL_FROM?: string;

  @IsOptional()
  @IsString()
  EMAIL_NAME?: string;

  @IsOptional()
  @IsString()
  MAILGUN_API_KEY?: string;

  @IsOptional()
  @IsString()
  MAILGUN_DOMAIN?: string;

  @IsOptional()
  @IsString()
  SMTP_HOST?: string;

  @TransformToInt
  @IsOptional()
  @IsNumber()
  SMTP_PORT?: number;

  @IsOptional()
  @IsString()
  SMTP_USER?: string;

  @IsOptional()
  @IsString()
  SMTP_PASSWORD?: string;

  @TransformToBoolean
  @IsOptional()
  @IsBoolean()
  ENABLE_SECURE_SMTP = false;
}
