import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';

import { authenticateToken } from './middleware/auth';
import authRoutes from './routes/auth';
import homeRoutes from './routes/home';
import userRoutes from './routes/user';

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://gaila.hku.hk'],
  }),
);

// Routes
app.use('/api/', homeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
