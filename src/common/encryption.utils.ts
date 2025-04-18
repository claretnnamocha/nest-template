import { decrypt as decryptFn, encrypt as encryptFn } from 'eccrypto';
import { config } from '.';

export const encrypt = async (payload: any): Promise<string> => {
  let str = typeof payload === 'string' ? payload : JSON.stringify(payload);

  let encrypted = await encryptFn(
    Buffer.from(config.ENCRYPTION_PUBLIC_KEY || '', 'hex'),
    Buffer.from(str),
  );
  let encryptedString: any = JSON.stringify(
    Object.fromEntries(
      Object.entries(encrypted).map(([key, value]: [string, Buffer]) => [
        key,
        value.toString('hex'),
      ]),
    ),
  );
  const encoded = Buffer.from(encryptedString).toString('base64');

  return encoded;
};

export const decrypt = async (encoded: string): Promise<string> => {
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  const encryptedHex = JSON.parse(decoded);
  const encrypted: any = Object.fromEntries(
    (Object.entries(encryptedHex) as [string, string][]).map(([key, value]) => [
      key,
      Buffer.from(value, 'hex'),
    ]),
  );
  const decryptedBuffer = await decryptFn(
    Buffer.from(config.ENCRYPTION_PRIVATE_KEY || '', 'hex'),
    encrypted,
  );
  const decryptedString = decryptedBuffer.toString();

  return decryptedString;
};
