import dotenv from 'dotenv';
import express, { Application } from 'express';

import courseRoutes from './routes/course';
import homeRoutes from './routes/home';
import userRoutes from './routes/user';

dotenv.config();

const app: Application = express();
app.use(express.json());

// Routes
app.use('/api/', homeRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
