import pool from 'config/db';
import { User } from 'types/user';

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

export const fetchUserById = async (id: number): Promise<User | null> => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  const result = rows as User[];
  return result.length > 0 ? result[0] : null;
};
