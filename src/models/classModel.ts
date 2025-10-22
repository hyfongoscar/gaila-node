import pool from 'config/db';
import { Class, ClassOption } from 'types/class';

export const fetchClassListingByTeacherId = async (
  id: number,
  limit: number,
  page: number,
): Promise<Class[]> => {
  const [classRows] = await pool.query(
    'SELECT * FROM classes JOIN class_teachers ON classes.id = class_teachers.class_id WHERE class_teachers.teacher_id = ? LIMIT ? OFFSET ?',
    [id, limit, (page - 1) * limit],
  );
  return classRows as Class[];
};

export const fetchClassesCountByTeacherId = async (
  id: number,
): Promise<number> => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) FROM classes JOIN class_teachers ON classes.id = class_teachers.class_id WHERE class_teachers.teacher_id = ?',
    [id],
  );
  const result = rows as { 'COUNT(*)': number }[];
  return result.length > 0 ? result[0]['COUNT(*)'] : 0;
};

export const fetchClassOptionsByTeacherId = async (
  id: number,
): Promise<ClassOption[]> => {
  const [classRows] = await pool.query(
    `SELECT classes.id as id, classes.name as name, COUNT(*) as numStudents
      FROM classes
      JOIN class_students ON classes.id = class_students.class_id
      WHERE class_id IN (
        SELECT class_id FROM class_teachers WHERE teacher_id = ?
      )
      GROUP BY classes.id`,
    [id],
  );
  return classRows as ClassOption[];
};

export const fetchClassListingByStudentId = async (
  id: number,
  limit: number,
  page: number,
): Promise<Class[]> => {
  const [classStudentRows] = await pool.query(
    'SELECT * FROM classes JOIN class_students ON classes.id = class_students.student_id WHERE student_id = ? LIMIT ? OFFSET ?',
    [id, limit, (page - 1) * limit],
  );
  return classStudentRows as Class[];
};

export const fetchClassesCountByStudentId = async (
  id: number,
): Promise<number> => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) FROM classes JOIN class_students ON classes.id = class_students.student_id WHERE student_id = ?',
    [id],
  );
  const result = rows as { 'COUNT(*)': number }[];
  return result.length > 0 ? result[0]['COUNT(*)'] : 0;
};

export const fetchClassById = async (id: number): Promise<Class | null> => {
  const [rows] = await pool.query('SELECT * FROM classes WHERE id = ?', [id]);
  const result = rows as Class[];
  return result.length > 0 ? result[0] : null;
};

export const fetchClassesByIds = async (ids: number[]): Promise<Class[]> => {
  const [rows] = await pool.query(`SELECT * FROM classes WHERE id IN (?)`, [
    ids,
  ]);
  return rows as Class[];
};
