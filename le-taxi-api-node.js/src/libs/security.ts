// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as crypto from 'crypto';
import { configs } from '../config/configs';
import { AuthenticatedUser } from '../features/users/user.model';

const nJwt = require("njwt");
const _signingKeyForJwtCreation = getSigningKeyForJwtCreation();
const iv = '0000000000000000';

// We are using an AES 256 CBC encryption with a secret stored outside this system
// It is assumed safe in this case to use a null initialization vector since
// the text we are encoding is generated randomly on the backend

class Security {
  encrypt(text: string): string {
    const encrypter = crypto.createCipheriv('aes-256-cbc', configs.security.secret, iv);
    const cipher = encrypter.update(text,'utf8','hex') + encrypter.final('hex');
    return cipher;
  }

  decrypt(text: string): string {
    const decrypter = crypto.createDecipheriv('aes-256-cbc', configs.security.secret, iv)
    const decipher = decrypter.update(text,'hex','utf8') + decrypter.final('utf8');
    return decipher;
  }

  check(plain: string, cipher: string) {
    return cipher === this.encrypt(plain);
  }

  createJwt(user: AuthenticatedUser): any {
    const claims = {
      user: user.email,
      role: user.role_name,
      apikey: user.apikey
    };

    const jwt = nJwt.create(claims, _signingKeyForJwtCreation);
    const date = new Date();
    jwt.setExpiration(date.setDate(date.getDate() + 1)); // 24 heures
    return jwt.compact();
  }
}

export function getSigningKeyForJwtCreation(): string {
  return configs.security.jwt;
}

export const security = new Security();
