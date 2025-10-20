import pool from '../config/db';
import { RefreshToken, User } from '../types/course';

export const fetchAllUsers = async (): Promise<User[]> => {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows as User[];
};

export const fetchUserByUsername = async (
  username: string,
): Promise<User | null> => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [
    username,
  ]);
  const result = rows as User[];
  return result.length > 0 ? result[0] : null;
};

export const fetchRefreshTokenByUserId = async (
  userId: number,
): Promise<string | null> => {
  const [rows] = await pool.query(
    'SELECT token_hash FROM refresh_tokens WHERE user_id = ?',
    [userId],
  );
  const result = rows as RefreshToken[];
  return result.length > 0 ? result[0].tokenHash : null;
};

export const fetchRefreshTokenByTokenHash = async (
  tokenHash: string,
): Promise<RefreshToken | null> => {
  const [rows] = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token_hash = ?',
    [tokenHash],
  );
  const result = rows as RefreshToken[];
  return result.length > 0 ? result[0] : null;
};

export const storeRefreshToken = async (
  userId: number,
  tokenHash: string,
  expiresAt: number,
): Promise<void> => {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at, updated_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE token_hash = ?, expires_at = ?, updated_at = ?',
    [
      userId,
      tokenHash,
      expiresAt,
      Date.now(),
      tokenHash,
      expiresAt,
      Date.now(),
    ],
  );
};
