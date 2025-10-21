export interface RefreshToken {
  userId: number;
  tokenHash: string;
  expiresAt: number;
  updatedAt: number;
}
