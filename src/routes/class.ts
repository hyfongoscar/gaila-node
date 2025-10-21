import { getClassDetails, getUserClasses } from 'controllers/classController';
import { Router } from 'express';
import { authorizeRole } from 'middleware/auth';

const router = Router();

router.get('/listing', authorizeRole(), getUserClasses);
router.get('/view/:id', authorizeRole(), getClassDetails);

export default router;
