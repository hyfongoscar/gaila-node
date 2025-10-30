import { ResultSetHeader } from 'mysql2';

import pool from 'config/db';
import { Assignment, AssignmentEnrollment } from 'types/assignment';
import { Class, ClassTeacher } from 'types/class';

export const fetchAssignmentsByTeacherId = async (
  id: number,
  limit: number,
  page: number,
): Promise<Class[]> => {
  const [classRows] = await pool.query(
    'SELECT assignments.* FROM assignments JOIN assignment_teachers ON assignments.id = assignment_teachers.assignment_id WHERE assignment_teachers.teacher_id = ? LIMIT ? OFFSET ?',
    [id, limit, (page - 1) * limit],
  );
  return classRows as Class[];
};

export const fetchAssignmentsCountByTeacherId = async (
  id: number,
): Promise<number> => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) FROM assignments JOIN assignment_teachers ON assignments.id = assignment_teachers.assignment_id WHERE assignment_teachers.teacher_id = ?',
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
    'SELECT assignments.* FROM assignments JOIN class_students ON assignments.id = class_students.student_id WHERE student_id = ? LIMIT ? OFFSET ?',
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

export const fetchAssignementEnrollmentsById = async (
  id: number,
): Promise<AssignmentEnrollment[]> => {
  const [targetRows] = await pool.query(
    `SELECT at.id, at.assignment_id as assignment_id, at.class_id as class_id, at.student_id as student_id,
        grouped_classes.name as class_name, grouped_classes.num_students as num_students,
        users.username as username, users.first_name as first_name, users.last_name as last_name FROM assignment_targets at
      LEFT JOIN (
        SELECT classes.id as id, classes.name as name, COUNT(*) as num_students
        FROM classes
        JOIN class_students ON classes.id = class_students.class_id
        GROUP BY classes.id
      ) grouped_classes on grouped_classes.id = at.class_id
      LEFT JOIN users ON users.id = at.student_id
      WHERE at.assignment_id = ?`,
    [id],
  );
  const result = targetRows as AssignmentEnrollment[];
  return result;
};

export const saveNewAssignment = async (
  title: string,
  description: string,
  dueDate: string,
  type: string,
  instructions: string,
  requirements: string,
  rubrics: string,
  tips: string,
  createdBy: number,
  enrolledClassIds: number[],
  enrolledStudentIds: number[],
): Promise<Assignment | null> => {
  const [insertRows] = await pool.query(
    'INSERT INTO assignments (title, description, due_date, type, instructions, requirements, rubrics, tips, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      title,
      description || null,
      dueDate || null,
      type || null,
      instructions || null,
      requirements,
      rubrics || null,
      tips || null,
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
  for (const enrolledStudentId of enrolledStudentIds) {
    await pool.query(
      'INSERT INTO assignment_targets (assignment_id, student_id) VALUES (?, ?)',
      [assignmentId, enrolledStudentId],
    );
  }
  return result.length > 0 ? result[0] : null;
};

export const updateExistingAssignment = async (
  assignmentId: number,
  title: string,
  description: string,
  dueDate: string,
  type: string,
  instructions: string,
  requirements: string,
  rubrics: string,
  tips: string,
  newEnrolledClassIds: number[],
  newEnrolledStudentIds: number[],
): Promise<Assignment | null> => {
  const updateParams = [];
  const placeholders = [];
  if (title) {
    updateParams.push(title);
    placeholders.push('title = ?');
  }
  if (description) {
    updateParams.push(description);
    placeholders.push('description = ?');
  }
  if (dueDate) {
    updateParams.push(dueDate);
    placeholders.push('due_date = ?');
  }
  if (type) {
    updateParams.push(type);
    placeholders.push('type = ?');
  }
  if (instructions) {
    updateParams.push(instructions);
    placeholders.push('instructions = ?');
  }
  if (requirements) {
    updateParams.push(requirements);
    placeholders.push('requirements = ?');
  }
  if (rubrics) {
    updateParams.push(rubrics);
    placeholders.push('rubrics = ?');
  }
  if (tips) {
    updateParams.push(tips);
    placeholders.push('tips = ?');
  }

  await pool.query(
    `UPDATE assignments SET ${placeholders.join(', ')} WHERE id = ?`,
    [...updateParams, assignmentId],
  );
  const [assignmentRows] = await pool.query(
    'SELECT * FROM assignments WHERE id = ?',
    [assignmentId],
  );
  const result = assignmentRows as Assignment[];

  const [enrolledClassRows] = await pool.query(
    'SELECT * FROM assignment_targets WHERE assignment_id = ?',
    [assignmentId],
  );
  const enrolledClasses = enrolledClassRows as AssignmentEnrollment[];

  for (const enrolledClass of enrolledClasses) {
    if (
      ('class_id' in enrolledClass &&
        enrolledClass.class_id !== null &&
        !newEnrolledClassIds.includes(enrolledClass.class_id)) ||
      ('student_id' in enrolledClass &&
        enrolledClass.student_id !== null &&
        !newEnrolledStudentIds.includes(enrolledClass.student_id))
    ) {
      await pool.query('DELETE FROM assignment_targets WHERE id = ?', [
        enrolledClass.id,
      ]);
      const [teacherRows] = await pool.query(
        'SELECT teacher_id FROM class_teachers WHERE class_id = ?',
        [enrolledClass.id],
      );
      const teacherIds = (teacherRows as ClassTeacher[]).map(
        row => row.teacher_id,
      );
      for (const teacherId of teacherIds) {
        await pool.query(
          'DELETE FROM assignment_teachers WHERE assignment_id = ? AND teacher_id = ?',
          [assignmentId, teacherId],
        );
      }
    }
  }

  for (const enrolledClassId of newEnrolledClassIds) {
    if (
      enrolledClasses.some(
        enrolledClass =>
          'class_id' in enrolledClass &&
          enrolledClass.class_id !== null &&
          enrolledClass.class_id === enrolledClassId,
      )
    ) {
      continue;
    }
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

  for (const enrolledStudentId of newEnrolledStudentIds) {
    if (
      enrolledClasses.some(
        enrolledClass =>
          'student_id' in enrolledClass &&
          enrolledClass.student_id === enrolledStudentId,
      )
    ) {
      continue;
    }
    await pool.query(
      'INSERT INTO assignment_targets (assignment_id, student_id) VALUES (?, ?)',
      [assignmentId, enrolledStudentId],
    );
  }
  return result.length > 0 ? result[0] : null;
};
