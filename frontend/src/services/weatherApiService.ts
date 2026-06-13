const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// 1. Declare the shape of a single hour data point
export interface HourlyForecast {
  time: string;
  tempC: number;
  condition: string;
}

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localTime: string;
  };
  current: {
    tempC: number;
    condition: string;
    conditionCode: number;
    humidity: number;
    windKph: number;
    visibilityKm: number;
    airQuality: {
      pm25: number | null;
      usEpaIndex: number | null;
    };
  };
  // 2. Add the hour tracking array straight into the forecast array objects
  forecast: Array<{
    date: string;
    maxTempC: number;
    minTempC: number;
    condition: string;
    conditionCode: number;
    avgHumidity: number;
    hour: HourlyForecast[]; // <-- Added right here!
  }>;
}

export class WeatherApiService {
  /**
   * Contacts our local backend proxy server to securely fetch weather data
   * @param query City name, state, or lat/lon coordinates
   */
  static async fetchWeather(query: string): Promise<WeatherData> {
    const url = `${BACKEND_URL}/weather?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error inside WeatherApiService:", errorMessage);
      throw new Error(errorMessage);
    }
  }
}