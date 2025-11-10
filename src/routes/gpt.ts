import { askGptModel, getGptHistory } from 'controllers/gptController';
import { Router } from 'express';

const router = Router();

router.post('/ask', askGptModel);
router.get('/listing', getGptHistory);

export default router;
