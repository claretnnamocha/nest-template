import { logger } from '../../common';

export class DataBaseSeeder {
  public static async seed() {
    logger.debug('Seeding database');

    logger.debug('Database seeded 🌱');
  }
}
