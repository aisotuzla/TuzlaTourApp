import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';

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
  lang?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className = 'top-6 right-6', lang = 'en' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=44.5328&longitude=18.6705&current=temperature_2m,weather_code&timezone=Europe%2FSarajevo`)
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
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
      className={`absolute ${className} z-[150] pointer-events-auto bg-white/40 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-white/20 animate-in fade-in duration-500 overflow-hidden transition-all`}
    >
      <div className="px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2">
        {getWeatherIcon(weather.weathercode, "w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600")}
        <span className="font-black text-blue-950 text-xs sm:text-sm">{Math.round(weather.temperature)}°C</span>
      </div>
    </div>
  );
};

