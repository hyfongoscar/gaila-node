import {
  createAssignment,
  getAssignmentDetails,
  getAssignmentSubmissionDetails as getAssignmentProgressDetails,
  getUserAssignments,
  submitAssignment,
  updateAssignment,
} from 'controllers/assignmentController';
import { Router } from 'express';
import { authorizeRole } from 'middleware/auth';

const router = Router();

router.get('/listing', authorizeRole(), getUserAssignments);
router.get('/view', authorizeRole(), getAssignmentDetails);
router.post('/create', authorizeRole(['teacher', 'admin']), createAssignment);
router.post('/update', authorizeRole(['teacher', 'admin']), updateAssignment);
router.get('/view-progress', authorizeRole(), getAssignmentProgressDetails);
router.post('/submit', authorizeRole(['student']), submitAssignment);

export default router;
