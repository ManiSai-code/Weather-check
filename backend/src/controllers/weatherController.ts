import { Request, Response } from 'express';
import { WeatherService } from '../services/weatherService.js';

export class WeatherController {
  /**
   * GET /api/weather?q=cityName
   */
  static async getWeather(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({ 
          error: "Missing required query parameter 'q'. Please provide a city name or lat,lon coordinates." 
        });
        return;
      }

      // Delegate the actual business logic to our service layer
      const weatherData = await WeatherService.getForecast(q);
      
      res.status(200).json(weatherData);
    } catch (error: any) {
      console.error("Controller Error:", error.message);
      res.status(500).json({ 
        error: error.message || "An internal server error occurred while retrieving weather statistics." 
      });
    }
  }
}