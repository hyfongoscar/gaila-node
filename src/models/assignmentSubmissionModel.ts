import { ResultSetHeader } from 'mysql2';

import pool from 'config/db';
import {
  AssignmentSubmission,
  AssignmentSubmissionListingItem,
} from 'types/assignment';

export const fetchLatestSubmissionsByAssignmentIdStudentId = async (
  assignmentId: number,
  studentId: number,
): Promise<AssignmentSubmission[]> => {
  const [rows] = await pool.query(
    `
    SELECT s.*
    FROM assignment_submissions s
    INNER JOIN (
      SELECT stage_id, max(submitted_at) as max_submitted_at
      FROM assignment_submissions
      WHERE assignment_id = ? AND student_id = ?
      GROUP BY stage_id
    ) latest_submissions
      ON latest_submissions.stage_id = s.stage_id
      AND latest_submissions.max_submitted_at = s.submitted_at
    INNER JOIN (
      SELECT id as stage_id
      FROM assignment_stages
      WHERE assignment_id = ? AND enabled = 1
    ) stages on stages.stage_id = s.stage_id
    `,
    [assignmentId, studentId, assignmentId],
  );
  return rows as AssignmentSubmission[];
};

export const fetchLatestSubmissionByStageIdStudentId = async (
  stageId: number,
  studentId: number,
): Promise<AssignmentSubmission | null> => {
  const [rows] = await pool.query(
    `
    SELECT s.*
    FROM assignment_submissions s
    INNER JOIN (
      SELECT stage_id, max(submitted_at) as max_submitted_at
      FROM assignment_submissions
      WHERE stage_id = ? AND student_id = ?
    ) latest_submissions
      ON latest_submissions.stage_id = s.stage_id
      AND latest_submissions.max_submitted_at = s.submitted_at
    INNER JOIN (
      SELECT id as stage_id
      FROM assignment_stages
      WHERE enabled = 1
    ) stages on stages.stage_id = s.stage_id
    `,
    [stageId, studentId],
  );
  const result = rows as AssignmentSubmission[];
  return result.length > 0 ? result[0] : null;
};

export const saveNewAssignmentSubmission = async (
  assignmentId: number,
  stageId: number,
  studentId: number,
  content: string,
  isFinal: boolean,
): Promise<AssignmentSubmission> => {
  const [insertRows] = await pool.query(
    'INSERT INTO assignment_submissions (assignment_id, stage_id, student_id, content, submitted_at, is_final) VALUES (?, ?, ?, ?, ?, ?)',
    [assignmentId, stageId, studentId, content, Date.now(), isFinal],
  );
  const insertResult = insertRows as ResultSetHeader;
  const submissionId = insertResult.insertId;
  return {
    id: submissionId,
    assignment_id: assignmentId,
    stage_id: stageId,
    student_id: studentId,
    content,
    submitted_at: Date.now(),
    is_final: isFinal,
  };
};

export const fetchLatestSubmissionsByAssignmentIdTeacherId = async (
  assignmentId: number,
  teacherId: number,
  limit: number,
  page: number,
  filter: string,
): Promise<AssignmentSubmissionListingItem[]> => {
  const [rows] = await pool.query(
    `
    SELECT
      t.id, t.assignment_id, t.submitted_at, t.is_final,
      t.stage_id, t.stage_type,
      t.score,
      t.student_id, t.username, t.first_name, t.last_name
    FROM (
      SELECT
        s.id, s.assignment_id, s.stage_id, s.student_id, s.submitted_at, s.is_final,
        stages.stage_type as stage_type,
        ag.score as score,
        users.username, users.first_name, users.last_name, CONCAT(users.first_name, ' ', users.last_name) as full_name
      FROM assignment_submissions s
      INNER JOIN (
        SELECT stage_id, student_id, max(submitted_at) as max_submitted_at
        FROM assignment_submissions
        WHERE assignment_id = ?
        GROUP BY stage_id, student_id
      ) latest_submissions
        ON latest_submissions.stage_id = s.stage_id
        AND latest_submissions.student_id = s.student_id
        AND latest_submissions.max_submitted_at = s.submitted_at
      INNER JOIN (
        SELECT *
        FROM assignment_stages
        WHERE assignment_id = ? AND enabled = 1
      ) stages on stages.id = s.stage_id
      INNER JOIN assignment_teachers at ON s.assignment_id = at.assignment_id AND at.teacher_id = ?
      INNER JOIN users ON s.student_id = users.id
      LEFT JOIN assignment_grades ag ON ag.submission_id = s.id
    ) t
    ${filter ? `WHERE full_name LIKE '%${filter}%' OR username LIKE '%${filter}%'` : ''}
    LIMIT ? OFFSET ?
    `,
    [assignmentId, assignmentId, teacherId, limit, (page - 1) * limit],
  );
  return rows as AssignmentSubmissionListingItem[];
};

export const fetchLatestSubmissionsCountByAssignmentIdTeacherId = async (
  assignmentId: number,
  teacherId: number,
  filter: string,
): Promise<number | null> => {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) FROM (
      SELECT s.id, s.assignment_id, s.stage_id, s.student_id, s.submitted_at, users.username, users.first_name, users.last_name, CONCAT(users.first_name, ' ', users.last_name) as full_name
      FROM assignment_submissions s
      INNER JOIN (
        SELECT stage_id, student_id, max(submitted_at) as max_submitted_at
        FROM assignment_submissions
        WHERE assignment_id = ? AND is_final = 1
        GROUP BY stage_id, student_id
      ) latest_submissions
        ON latest_submissions.stage_id = s.stage_id
        AND latest_submissions.student_id = s.student_id
        AND latest_submissions.max_submitted_at = s.submitted_at
      INNER JOIN (
        SELECT id as stage_id
        FROM assignment_stages
        WHERE assignment_id = ? AND enabled = 1
      ) stages on stages.stage_id = s.stage_id
      INNER JOIN assignment_teachers at ON s.assignment_id = at.assignment_id AND at.teacher_id = ?
      INNER JOIN users ON s.student_id = users.id
    ) t
    ${filter ? `WHERE full_name LIKE '%${filter}%' OR username LIKE '%${filter}%'` : ''}
    `,
    [assignmentId, assignmentId, teacherId],
  );
  const result = rows as { 'COUNT(*)': number }[];
  return result.length > 0 ? result[0]['COUNT(*)'] : null;
};
