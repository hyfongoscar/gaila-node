import { createTraceData } from 'controllers/traceDataController';
import { Router } from 'express';

const router = Router();

router.post('/save', createTraceData);

export default router;
