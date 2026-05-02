import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, ChevronDown } from 'lucide-react';

interface HourlyForecast {
  time: Date;
  temperature: number;
  weathercode: number;
}

interface WeatherData {
  temperature: number;
  weathercode: number;

}

const getWeatherIcon = (code: number, className: string) => {
  let Icon = Sun;
  if (code === 0) Icon = Sun; // Clear sky
  else if (code >= 1 && code <= 3) Icon = Cloud; // Partly cloudy, overcast
  else if (code >= 45 && code <= 48) Icon = CloudFog; // Fog
  else if (code >= 51 && code <= 67) Icon = CloudRain; // Drizzle, Rain, Freezing Rain
  else if (code >= 71 && code <= 77) Icon = CloudSnow; // Snow fall, Snow grains
  else if (code >= 80 && code <= 82) Icon = CloudRain; // Rain showers
  else if (code >= 85 && code <= 86) Icon = CloudSnow; // Snow showers
  else if (code >= 95 && code <= 99) Icon = CloudLightning; // Thunderstorm

  return <Icon className={className} />;
};

interface WeatherWidgetProps {
  className?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className = 'top-4 right-4' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=44.5328&longitude=18.6705&current=temperature_2m,weather_code&timezone=Europe%2FSarajevo`)
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
          let forecast: HourlyForecast[] = [];
          if (data.hourly && data.hourly.time) {
            const now = new Date();
            // Find index of current or next hour
            const currentIndex = data.hourly.time.findIndex((t: string) => new Date(t).getTime() > now.getTime());
            const startIndex = currentIndex !== -1 ? currentIndex : 0;

            // Get next 4 hours
            for (let i = startIndex; i < Math.min(startIndex + 4, data.hourly.time.length); i++) {
              if (data.hourly.time[i]) {
                forecast.push({
                  time: new Date(data.hourly.time[i]),
                  temperature: data.hourly.temperature_2m[i],
                  weathercode: data.hourly.weather_code[i]
                });
              }
            }
          }

          setWeather({
            temperature: data.current.temperature_2m,
            weathercode: data.current.weather_code,

          });
        }
      })
      .catch(console.error);
  }, []);

  if (!weather) return null;

  return (
    <div
      className={`absolute ${className} z-[1000] pointer-events-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 animate-in fade-in duration-500 overflow-hidden cursor-pointer transition-all`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="px-3 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {getWeatherIcon(weather.weathercode, "w-5 h-5 text-blue-600")}
          <span className="font-black text-blue-950">{Math.round(weather.temperature)}°C</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </div>
    </div>
  );
};
