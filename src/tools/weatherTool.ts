export async function fetchLiveWeather(location: string): Promise<string> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return `Could not find weather coordinates for "${location}".`;
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`
    );
    const weatherData = await weatherRes.json();

    return `${name}, ${country}: ${weatherData.current.temperature_2m}°C, Humidity: ${weatherData.current.relative_humidity_2m}%`;
  } catch {
    return 'Weather service currently unavailable.';
  }
}

export function computeDailyBudget(totalBudget: number, days: number): string {
  if (days <= 0) return 'Duration must be at least 1 day.';
  const daily = (totalBudget / days).toFixed(2);
  return `$${daily} / day`;
}