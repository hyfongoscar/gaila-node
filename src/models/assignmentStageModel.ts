import pool from 'config/db';
import { AssignmentStage } from 'types/assignment';

export const fetchAssignmentStagesByAssignmentId = async (
  assignmentId: number,
): Promise<AssignmentStage[]> => {
  const [rows] = await pool.query(
    `
    SELECT id, assignment_id, stage_type
    FROM assignment_stages
    WHERE assignment_id = ? AND enabled = 1
    ORDER BY order_index
    `,
    [assignmentId],
  );
  return rows as AssignmentStage[];
};
