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
