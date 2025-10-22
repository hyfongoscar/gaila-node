import { ResultSetHeader } from 'mysql2';

import pool from 'config/db';
import { Assignment } from 'types/assignment';
import { Class, ClassTeacher } from 'types/class';

export const fetchAssignmentsByTeacherId = async (
  id: number,
  limit: number,
  page: number,
): Promise<Class[]> => {
  const [classRows] = await pool.query(
    'SELECT * FROM assignment JOIN assignment_teachers ON assignment.id = assignment_teachers.class_id WHERE assignment_teachers.teacher_id = ? LIMIT ? OFFSET ?',
    [id, limit, (page - 1) * limit],
  );
  return classRows as Class[];
};
export const fetchAssignmentsCountByTeacherId = async (
  id: number,
): Promise<number> => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) FROM assignment JOIN assignment_teachers ON assignment.id = assignment_teachers.class_id WHERE assignment_teachers.teacher_id = ?',
    [id],
  );
  const result = rows as { 'COUNT(*)': number }[];
  return result.length > 0 ? result[0]['COUNT(*)'] : 0;
};

export const fetchAssignmentsByStudentId = async (
  id: number,
  limit: number,
  page: number,
): Promise<Class[]> => {
  const [classStudentRows] = await pool.query(
    'SELECT * FROM assignments JOIN class_students ON assignments.id = class_students.student_id WHERE student_id = ? LIMIT ? OFFSET ?',
    [id, limit, (page - 1) * limit],
  );
  return classStudentRows as Class[];
};

export const fetchAssignmentsCountByStudentId = async (
  id: number,
): Promise<number> => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) FROM assignments JOIN class_students ON assignments.id = class_students.student_id WHERE student_id = ?',
    [id],
  );
  const result = rows as { 'COUNT(*)': number }[];
  return result.length > 0 ? result[0]['COUNT(*)'] : 0;
};

export const fetchAssignmentById = async (
  id: number,
): Promise<Class | null> => {
  const [rows] = await pool.query('SELECT * FROM assignments WHERE id = ?', [
    id,
  ]);
  const result = rows as Class[];
  return result.length > 0 ? result[0] : null;
};

export const saveNewAssignment = async (
  title: string,
  description: string,
  dueDate: string,
  type: string,
  instructions: string,
  minWordCount: number | null,
  maxWordCount: number | null,
  rubrics: string,
  createdBy: number,
  enrolledClassIds: number[],
  enrooledStudentIds: number[],
): Promise<Assignment | null> => {
  const [insertRows] = await pool.query(
    'INSERT INTO assignments (title, description, due_date, type, instructions, min_word_count, max_word_count, rubrics, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      title,
      description || null,
      dueDate || null,
      type || null,
      instructions || null,
      minWordCount || null,
      maxWordCount || null,
      rubrics || null,
      createdBy,
    ],
  );
  const insertResult = insertRows as ResultSetHeader;
  const assignmentId = insertResult.insertId;
  const [assignmentRows] = await pool.query(
    'SELECT * FROM assignments WHERE id = ?',
    [assignmentId],
  );
  const result = assignmentRows as Assignment[];

  for (const enrolledClassId of enrolledClassIds) {
    const [teacherRows] = await pool.query(
      'SELECT teacher_id FROM class_teachers WHERE class_id = ?',
      [enrolledClassId],
    );
    const teacherIds = (teacherRows as ClassTeacher[]).map(
      row => row.teacher_id,
    );
    for (const teacherId of teacherIds) {
      await pool.query(
        'INSERT INTO assignment_teachers (assignment_id, teacher_id) VALUES (?, ?)',
        [assignmentId, teacherId],
      );
    }
    await pool.query(
      'INSERT INTO assignment_targets (assignment_id, class_id) VALUES (?, ?)',
      [assignmentId, enrolledClassId],
    );
  }
  for (const enrolledStudentId of enrooledStudentIds) {
    await pool.query(
      'INSERT INTO assignment_targets (assignment_id, student_id) VALUES (?, ?)',
      [assignmentId, enrolledStudentId],
    );
  }
  return result.length > 0 ? result[0] : null;
};
