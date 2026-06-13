import { useState, useEffect } from 'react';
import { Search, Wind, Droplets, Eye, ShieldAlert, Calendar, CloudSun, Map as MapIcon } from 'lucide-react';
import { WeatherApiService, WeatherData } from './services/weatherApiService.js';
import './index.css';
import { formatTo12Hour } from './utils/formatters';
export default function App() {
  const [searchQuery, setSearchQuery] = useState('London');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await WeatherApiService.fetchWeather(searchQuery);
      setWeatherData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve weather data.');
    } finally {
      setLoading(false);
    }
  };

  // Run an initial load for London on launch
  useEffect(() => {
    WeatherApiService.fetchWeather('London')
      .then(data => setWeatherData(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
      {/* Header Container */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            AeroMap <span className="text-sm font-medium text-slate-400">Weather Studio</span>
          </h1>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search city, state, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-full py-2.5 pl-5 pr-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
          />
          <button type="submit" className="absolute right-2 top-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors">
            <Search className="w-4 h-4 text-white" />
          </button>
        </form>
      </header>

      {/* Main Framework Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Error Notification */}
        {error && (
          <div className="col-span-12 p-4 bg-red-950/40 border border-red-900/50 rounded-2xl text-red-400 text-sm flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LEFT COLUMN: Data Metrics (5 Cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {weatherData ? (
            <>
              {/* Highlight Hero Card */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{weatherData.location.name}</h2>
                    <p className="text-slate-400 text-sm">{weatherData.location.country}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-900 shadow-sm">
  {formatTo12Hour(weatherData.location.localTime)}
</span>
                </div>
                
                <div className="my-8 flex items-center justify-between">
                  <h3 className="text-6xl font-black tracking-tighter">{Math.round(weatherData.current.tempC)}°C</h3>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-blue-400">{weatherData.current.condition}</p>
                    <p className="text-xs text-slate-500">Local Condition Code: {weatherData.current.conditionCode}</p>
                  </div>
                </div>

                {/* Sub-Metric Subgrid */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/60">
                  <div className="flex flex-col items-center p-2 bg-slate-950/30 rounded-xl">
                    <Droplets className="w-5 h-5 text-blue-400 mb-1" />
                    <span className="text-xs text-slate-500">Humidity</span>
                    <span className="text-sm font-medium">{weatherData.current.humidity}%</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-slate-950/30 rounded-xl">
                    <Wind className="w-5 h-5 text-indigo-400 mb-1" />
                    <span className="text-xs text-slate-500">Wind</span>
                    <span className="text-sm font-medium">{weatherData.current.windKph} km/h</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-slate-950/30 rounded-xl">
                    <Eye className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-xs text-slate-500">Visibility</span>
                    <span className="text-sm font-medium">{weatherData.current.visibilityKm} km</span>
                  </div>
                </div>
              </div>

              {/* 7-Day Forecast Grid List */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md">
                <h4 className="text-sm font-bold tracking-wider uppercase text-slate-400 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" /> 7-Day Forecast Horizon
                </h4>
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[340px] pr-1">
                  {weatherData.forecast.map((day, idx) => (
                    <div key={day.date} className="flex items-center justify-between p-3 bg-slate-950/20 rounded-2xl border border-slate-900/50 hover:border-slate-800 transition-colors">
                      <span className="text-sm font-medium w-24">
                        {idx === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400 text-xs w-32">
                        <CloudSun className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{day.condition}</span>
                      </div>
                      <span className="text-sm font-bold tracking-tight">
                        <span className="text-slate-100">{Math.round(day.maxTempC)}°</span>
                        <span className="text-slate-500 ml-1.5">{Math.round(day.minTempC)}°</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              {loading ? 'Consulting atmospheric datasets...' : 'No data loaded.'}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Interactive Interactive Map Framework (7 Cols) */}
        <section className="lg:col-span-7 bg-slate-900/30 border border-slate-800/50 rounded-3xl overflow-hidden min-h-[500px] flex flex-col relative group">
          <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-950/20">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Spatial Interactive Map Canvas</span>
            </div>
            {weatherData && (
              <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                Center: {weatherData.location.lat.toFixed(2)}, {weatherData.location.lon.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Dynamic Map Placement Target Context */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950/50 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
            
            <div className="z-10 text-center max-w-sm">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MapIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h5 className="font-semibold text-slate-200 mb-1">Map Visualization Engine Pending</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our structural dashboard setup is safe. Next, we will introduce our mapping library to layer physical particle rendering systems over this viewport bounds.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}