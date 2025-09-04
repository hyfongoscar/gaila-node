import { Router } from 'express';

import { getAllCourses } from '../controllers/coursesController';

const router = Router();

router.get('/', getAllCourses);

export default router;
