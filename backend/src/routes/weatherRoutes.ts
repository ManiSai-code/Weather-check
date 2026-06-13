import { Router } from 'express';
import { WeatherController } from '../controllers/weatherController.js';

const router = Router();

// Route: GET /api/weather?q=...
router.get('/', WeatherController.getWeather);

export default router;