import pool from 'config/db';
import { AssignmentGrade } from 'types/assignment';

export const fetchLatestGradesBySubmissionIds = async (
  submissionIds: number[],
): Promise<AssignmentGrade[]> => {
  if (!submissionIds.length) {
    return [];
  }

  const placeholders = submissionIds.map(() => '?').join(',');

  const [rows] = await pool.query(
    `
    SELECT s.*,
      COALESCE(
        NULLIF(CONCAT(u.last_name, u.first_name), ''),
        u.username
      ) AS graded_by
    FROM assignment_grades s
    INNER JOIN (
      SELECT submission_id, max(graded_at) as max_graded_at
      FROM assignment_grades
      WHERE submission_id IN (${placeholders})
      GROUP BY submission_id
    ) latest_grades
      ON latest_grades.submission_id = s.submission_id
      AND latest_grades.max_graded_at = s.graded_at
    LEFT JOIN users u ON s.graded_by = u.id
    `,
    [...submissionIds],
  );
  return rows as AssignmentGrade[];
};
