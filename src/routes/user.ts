import { Router } from 'express';
import { authorizeRole } from 'middleware/auth';

import {
  getClassOptions,
  getStudentOptions,
} from '../controllers/userController';

const router = Router();

router.get(
  '/class-options',
  authorizeRole(['teacher', 'admin']),
  getClassOptions,
);
router.get(
  '/student-options',
  authorizeRole(['teacher', 'admin']),
  getStudentOptions,
);

export default router;
