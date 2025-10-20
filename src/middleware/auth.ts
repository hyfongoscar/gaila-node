import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload extends jwt.JwtPayload {
  id: number;
  username: string;
}

interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const tokenSecret = process.env.TOKEN_SECRET;
  const tokenExpiresIn = Number(process.env.TOKEN_EXPIRES_IN);

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  if (!tokenSecret || !tokenExpiresIn || isNaN(tokenExpiresIn)) {
    return res
      .status(500)
      .json({ message: 'Token secrets and expiration are not configured' });
  }

  jwt.verify(token, tokenSecret, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    const user = payload as UserPayload;
    req.user = user;
    next();
  });
}
