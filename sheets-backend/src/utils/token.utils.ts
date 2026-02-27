import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

// Define the secret outside the function
const secret = {
  jwt_secret: process.env.JWT_SECRET || 'default_jwt_secret',
  app_id: 'digihealth-admin-token-creator',
  app_password: 'hockeystick',
};

export interface TokenDecodeResult {
  decoded: any;
  user_id: string;
}

export function verifyAndExtractToken(token: string): TokenDecodeResult {
  try {
    // First, decode to check the algorithm
    const unverified_decoded = jwt.decode(token, { complete: true });
    const jwt_header = unverified_decoded?.header;

    let secretKey = '';
    if (jwt_header?.alg?.startsWith('HS')) {
      secretKey = secret.app_password;
    } else {
      secretKey = secret.jwt_secret;
    }

    // Verify and decode the token
    const decoded: any = jwt.verify(token, secretKey);

    // Extract user_id from various possible fields
    const user_id: string =
      decoded?.sub || decoded?.user_id || decoded?.id || 'anonymous';

    return { decoded, user_id };
  } catch (error) {
    throw new UnauthorizedException('Invalid token');
  }
}

// Simple function for just getting user_id when you don't need the full decoded token
export function extractUserIdFromToken(token: string): string {
  const result = verifyAndExtractToken(token);
  return result.user_id;
}
