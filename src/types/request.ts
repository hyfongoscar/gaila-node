import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface UserPayload extends JwtPayload {
  id: number;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
