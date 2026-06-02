import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-dev-only';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-dev-only';
const ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN as string) || 900;
const REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN as string) || 604800;

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN } as jwt.SignOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}
