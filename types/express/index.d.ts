import { User } from '../common/database/models';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
