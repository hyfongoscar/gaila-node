import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { fetchUserById } from 'models/userModel';

import { AuthenticatedRequest, UserPayload } from 'types/request';
import { User } from 'types/user';

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

export function authorizeRole(role?: User['role']) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await fetchUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRole = user.role;
    if (!!role && userRole !== role) {
      return res
        .status(403)
        .json({ message: 'Access forbidden: insufficient rights' });
    }

    req.user = user;
    next();
  };
}
