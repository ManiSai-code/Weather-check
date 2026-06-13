import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

export interface WeatherCoordinates {
  lat: number;
  lon: number;
}

export class WeatherService {
  /**
   * Fetches comprehensive weather data (current, 7-day forecast, air quality) for a location query.
   * @param query Can be a city name (e.g., "London") or lat/long coordinates (e.g., "48.8567,2.3508")
   */
  static async getForecast(query: string) {
    if (!API_KEY) {
      throw new Error("Server configuration error: Weather API key is missing.");
    }

    // We fetch current conditions, 7 days of forecast, and air quality indexes
    const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=7&aqi=yes&alerts=no`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch weather data from provider.');
      }

      const data = await response.json();
      return this.transformWeatherData(data);
    } catch (error) {
      console.error("Error in WeatherService:", error);
      throw error;
    }
  }

  /**
   * Transforms raw API data into a clean, optimized structure tailored for our frontend mapping app.
   */
  private static transformWeatherData(raw: any) {
    return {
      location: {
        name: raw.location.name,
        region: raw.location.region,
        country: raw.location.country,
        lat: raw.location.lat,
        lon: raw.location.lon,
        localTime: raw.location.localtime,
      },
      current: {
        tempC: raw.current.temp_c,
        condition: raw.current.condition.text,
        conditionCode: raw.current.condition.code, // Useful for mapping animations later!
        humidity: raw.current.humidity,
        windKph: raw.current.wind_kph,
        visibilityKm: raw.current.vis_km,
        airQuality: {
          pm25: raw.current.air_quality?.pm2_5 ? Math.round(raw.current.air_quality.pm2_5) : null,
          usEpaIndex: raw.current.air_quality?.['us-epa-index'] || null, 
        }
      },
      // We will map over the array to get a clean 7-day forecast format
      forecast: raw.forecast.forecastday.map((day: any) => ({
        date: day.date,
        maxTempC: day.day.maxtemp_c,
        minTempC: day.day.mintemp_c,
        condition: day.day.condition.text,
        conditionCode: day.day.condition.code,
        avgHumidity: day.day.avghumidity,
      })),
    };
  }
}