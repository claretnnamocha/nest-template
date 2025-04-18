import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '../database/models/types';
import { MetadataKeys } from './types';
import { translate } from '../i18n';

export { AuthGuard } from './auth.guard';
export { EncryptionGuard } from './encryption.guard';
export { LogGuard } from './log.guard';

export const Roles = (roles: UserRoles[]) =>
  SetMetadata(MetadataKeys.roles, roles);
export const Authorized = () => SetMetadata(MetadataKeys.requireJWT, true);
export const OTP = () => SetMetadata(MetadataKeys.requireTOTP, true);
export const UnAuthorized = () => SetMetadata(MetadataKeys.unauthorized, true);
export const UnEncrypted = () => SetMetadata(MetadataKeys.unEncrypted, true);

export const UnAuthorizedMessage = () => ({
  message: translate('MESSAGES.UNAUTHORIZED'),
});
