import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BaseEnvConfig } from './base.config';

class Config extends BaseEnvConfig {}

export let config: Config;

export const setupConfig = async () => {
  config = plainToInstance(Config, process.env);

  const [error] = await validate(config, { whitelist: true });
  if (error) return error;
};
