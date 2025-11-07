import { ResultSetHeader } from 'mysql2';

import pool from 'config/db';
import { AssignmentSubmission } from 'types/assignment';

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
