// netlify/functions/weather.js

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const DEFAULT_LAT = 32.0853;
const DEFAULT_LON = 34.7818;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=600' // cache 10 minutes
  };

  try {
    const { lat = DEFAULT_LAT, lon = DEFAULT_LON } = event.queryStringParameters || {};
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=he`;
    console.log('Fetching weather for lat:', lat, 'lon:', lon);

    const resp = await fetch(url);
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.message || `Weather API error: ${resp.status}`);
    }

    const result = {
      temp: Math.round(data.main.temp),
      conditionId: data.weather[0].id,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      dt: data.dt
    };

    console.log('Weather result:', JSON.stringify(result));
    return { statusCode: 200, headers, body: JSON.stringify(result) };

  } catch (err) {
    console.error('Weather handler error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
