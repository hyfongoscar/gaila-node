import {
  getAssignmentSubmissionListing,
  submitAssignment,
} from 'controllers/assignmentSubmissionController';
import { Router } from 'express';
import { authorizeRole } from 'middleware/auth';

const router = Router();

router.post('/submit', authorizeRole(['student']), submitAssignment);
// router.get(
//   '/recent',
//   authorizeRole(['teacher', 'admin']),
//   getRecentSubmissions,
// );
router.get(
  '/listing',
  authorizeRole(['teacher', 'admin']),
  getAssignmentSubmissionListing,
);
// router.get('/view', authorizeRole(['teacher', 'admin']), getSubmissionDetails);

export default router;
