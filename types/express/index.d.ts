import { User } from 'src/common/database/models';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
