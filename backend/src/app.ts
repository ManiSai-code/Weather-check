import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import weatherRouter from './routes/weatherRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Configuration
app.use(cors({ origin: '*' })); // For dev simplicity; can lock down to production domain later
app.use(express.json());

// Main API Route Declarations
app.use('/api/weather', weatherRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Weather Backend operational.' });
});

// Start listening for traffic
app.listen(PORT, () => {
  console.log(`⚡️ [Server]: Weather Backend is running at http://localhost:${PORT}`);
});

export default app;