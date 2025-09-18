import pool from '../config/db';
import { User } from '../types/course';

export const fetchAllUsers = async (): Promise<User[]> => {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows as User[];
};
