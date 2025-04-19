import * as mysql2 from 'mysql2';
import * as oracledb from 'oracledb';
import * as pg from 'pg';
import { SyncOptions } from 'sequelize';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { config, logger } from '..';
import * as models from './models';
import { DataBaseSeeder } from './seed-database';
import { translate } from '../i18n';

export class DatabaseProvider {
  public static readonly provide = 'SEQUELIZE';
  private static readonly dialectModules = {
    postgres: pg,
    mysql: mysql2,
    oracle: oracledb,
  };

  public static db = async () => {
    const dialectModule =
      this.dialectModules[
        config.DATABASE_DIALECT as keyof typeof this.dialectModules
      ];

    const sequelizeOptions: SequelizeOptions = {
      dialect: config.DATABASE_DIALECT,
      logging: config.ENABLE_DATABASE_LOGGING,
      models: Object.values(models),
      dialectOptions: {
        ssl: config.ENABLE_DATABASE_SSL
          ? { require: true, rejectUnauthorized: false }
          : undefined,
      },
      dialectModule,
    };

    if (!config.DATABASE_URL) {
      throw new Error(translate('DATABASE_URL_MISSING'));
    }
    return new Sequelize(config.DATABASE_URL, sequelizeOptions);
  };

  public static async useFactory(): Promise<Sequelize | null> {
    if (!config.ENABLE_DATABASE) {
      return null;
    }

    try {
      const syncOptions: SyncOptions = { alter: true };

      const db = await DatabaseProvider.db();
      await db.sync(syncOptions);

      return db;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('DB Error:', error.message);
      } else {
        logger.error('DB Error:', error);
      }
      return null;
    } finally {
      await DataBaseSeeder.seed();
    }
  }
}
