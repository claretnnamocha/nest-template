import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtService } from '../../jwt/jwt.service';
import { UserRoles } from '../database/models/types';
import { MetadataKeys } from './types';

@Injectable()
export class AuthGuard implements CanActivate {
  private context: ExecutionContext;

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  getMetadata<T>(key: string): T {
    return (
      this.reflector.get<T>(key, this.context.getHandler()) ||
      this.reflector.get<T>(key, this.context.getClass())
    );
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    try {
      this.context = context;
      const unauthorized = this.getMetadata<boolean>(MetadataKeys.unauthorized);
      if (unauthorized) return true;

      const requireJWT = this.getMetadata<boolean>(MetadataKeys.requireJWT);
      const requireTOTP = this.getMetadata<boolean>(MetadataKeys.requireTOTP);
      let roles = this.getMetadata<UserRoles[]>(MetadataKeys.roles);

      if (!(roles && roles.length)) roles = Object.values(UserRoles);

      const req: Request = context.switchToHttp().getRequest();

      const jwt = req.headers?.authorization?.split(' ')[1];
      const totp = requireTOTP ? req.headers?.totp : undefined;

      if (!jwt && requireJWT) throw new UnauthorizedException();

      const user = await this.jwtService.verifyJWT(jwt, roles, totp);

      if (!user) throw new UnauthorizedException();

      req.user = user;

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
