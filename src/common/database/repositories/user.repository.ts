import { BaseRepository } from './base.repository';
import { User } from '../models';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }
}
