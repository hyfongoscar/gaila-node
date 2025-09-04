import express, { Application } from 'express';
import dotenv from 'dotenv';
import courseRoutes from './routes/courses';

dotenv.config();

const app: Application = express();
app.use(express.json());

// Routes
app.use('/api/courses', courseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
