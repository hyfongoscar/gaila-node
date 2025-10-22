import pool from 'config/db';
import { ClassUser, ClassUserOption, User } from 'types/user';

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

export const fetchUsersByIds = async (ids: number[]): Promise<User[]> => {
  const [rows] = await pool.query(`SELECT * FROM users WHERE id IN (?)`, [ids]);
  return rows as User[];
};

export const fetchStudentsInTeachingClasses = async (
  teacherId: number,
): Promise<ClassUser[]> => {
  const [rows] = await pool.query(
    `SELECT users.*, classes.id as classId, classes.name as className FROM classes
      JOIN class_students ON classes.id = class_students.class_id
      JOIN users ON class_students.student_id = users.id
      WHERE class_id IN (
        SELECT class_id FROM class_teachers WHERE teacher_id = ?
      )`,
    [teacherId],
  );

  return rows as ClassUser[];
};

export const fetchStudentOptionsInClass = async (
  classId: number,
): Promise<ClassUserOption[]> => {
  const [rows] = await pool.query(
    `SELECT users.id as id, users.first_name as firstName, users.last_name as lastName, users.username as username, classes.id as classId, classes.name as className FROM classes
      JOIN class_students ON classes.id = class_students.class_id
      JOIN users ON class_students.student_id = users.id
      WHERE class_id = ?`,
    [classId],
  );

  return rows as ClassUserOption[];
};
