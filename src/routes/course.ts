import { Router } from 'express';

import { getAllCourses } from '../controllers/courseController';

const router = Router();

router.get('/', getAllCourses);

export default router;
