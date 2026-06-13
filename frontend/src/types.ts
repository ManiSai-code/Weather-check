export interface HourlyForecast {
  time: string;
  tempC: number;
  condition: string;
}

export interface ForecastDay {
  date: string;
  maxTempC: number;
  minTempC: number;
  condition: string;
  conditionCode: number;
  avgHumidity: number;
  hour: HourlyForecast[]; 
}

export interface WeatherData {
  location: { name: string; lat: number; lon: number; };
  current: { tempC: number; condition: string; humidity: number; windKph: number; };
  forecast: ForecastDay[];
}