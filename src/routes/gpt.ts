import { askGptModel } from 'controllers/gptController';
import { Router } from 'express';

const router = Router();

router.post('/ask', askGptModel);

export default router;
