import {
  createAssignment,
  getAssignmentDetails,
  getUserAssignments,
} from 'controllers/assignmentController';
import { Router } from 'express';
import { authorizeRole } from 'middleware/auth';

const router = Router();

router.get('/listing', authorizeRole(), getUserAssignments);
router.get('/view/:id', authorizeRole(), getAssignmentDetails);
router.post('/create', authorizeRole(['teacher', 'admin']), createAssignment);

export default router;
