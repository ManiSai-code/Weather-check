const BACKEND_URL = 'http://localhost:5000/api';

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
  forecast: Array<{
    date: string;
    maxTempC: number;
    minTempC: number;
    condition: string;
    conditionCode: number;
    avgHumidity: number;
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
      // We convert the unknown error safely to an Error object message
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error inside WeatherApiService:", errorMessage);
      throw new Error(errorMessage);
    }
  }
}