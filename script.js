/* ── WMO weather code map ───────────────────────── */
const WMO = {
  0:  { icon: '☀️',  desc: 'Clear sky' },
  1:  { icon: '🌤️', desc: 'Mainly clear' },
  2:  { icon: '⛅',  desc: 'Partly cloudy' },
  3:  { icon: '☁️',  desc: 'Overcast' },
  45: { icon: '🌫️', desc: 'Foggy' },
  48: { icon: '🌫️', desc: 'Rime fog' },
  51: { icon: '🌦️', desc: 'Light drizzle' },
  53: { icon: '🌦️', desc: 'Drizzle' },
  55: { icon: '🌧️', desc: 'Heavy drizzle' },
  61: { icon: '🌧️', desc: 'Slight rain' },
  63: { icon: '🌧️', desc: 'Moderate rain' },
  65: { icon: '🌧️', desc: 'Heavy rain' },
  71: { icon: '❄️',  desc: 'Slight snow' },
  73: { icon: '❄️',  desc: 'Moderate snow' },
  75: { icon: '❄️',  desc: 'Heavy snow' },
  77: { icon: '🌨️', desc: 'Snow grains' },
  80: { icon: '🌦️', desc: 'Slight showers' },
  81: { icon: '🌧️', desc: 'Moderate showers' },
  82: { icon: '⛈️',  desc: 'Violent showers' },
  85: { icon: '🌨️', desc: 'Snow showers' },
  86: { icon: '🌨️', desc: 'Heavy snow showers' },
  95: { icon: '⛈️',  desc: 'Thunderstorm' },
  96: { icon: '⛈️',  desc: 'Thunderstorm w/ hail' },
  99: { icon: '⛈️',  desc: 'Thunderstorm w/ heavy hail' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function wmo(code) {
  return WMO[code] || { icon: '🌡️', desc: 'Unknown' };
}

function searchCity(city) {
  document.getElementById('cityInput').value = city;
  getTravelInfo();
}

/* ── UI helpers ─────────────────────────────────── */
function setLoading(on) {
  document.getElementById('loading').classList.toggle('hidden', !on);
  const btn = document.getElementById('searchBtn');
  btn.disabled = on;
  btn.textContent = on ? 'Searching…' : 'Search';
  if (on) {
    document.getElementById('errorBox').classList.add('hidden');
    document.getElementById('result').classList.add('hidden');
  }
}

function showError(msg) {
  setLoading(false);
  const el = document.getElementById('errorBox');
  el.textContent = msg;
  el.classList.remove('hidden');
}

/* ── Main fetch ─────────────────────────────────── */
async function getTravelInfo() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) { showError('Please enter a city name.'); return; }

  setLoading(true);

  try {
    /* API 1 — Open-Meteo Geocoding */
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`
    );
    if (!geoRes.ok) throw new Error('Geocoding service unavailable.');
    const geoData = await geoRes.json();
    if (!geoData.results?.length) throw new Error(`City "${city}" not found. Try a different spelling.`);

    const { latitude: lat, longitude: lon, country, name, country_code: cc } = geoData.results[0];

    /* API 1 — Open-Meteo Weather + 7-day forecast */
    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&wind_speed_unit=kmh&timezone=auto&forecast_days=7`
    );
    if (!wxRes.ok) throw new Error('Weather service unavailable.');
    const wx = await wxRes.json();
    const cur = wx.current;

    /* API 2 — REST Countries */
    const cRes = await fetch(`https://restcountries.com/v3.1/alpha/${cc.toLowerCase()}`);
    if (!cRes.ok) throw new Error('Country data unavailable.');
    const c = (await cRes.json())[0];

    const capital    = c.capital?.[0] ?? '—';
    const languages  = c.languages  ? Object.values(c.languages).slice(0, 3).join(', ') : '—';
    const currencies = c.currencies
      ? Object.values(c.currencies).map(x => `${x.name} (${x.symbol ?? '?'})`).slice(0, 2).join(', ')
      : '—';
    const area = c.area ? c.area.toLocaleString() + ' km²' : '—';
    const w = wmo(cur.weather_code);

    const forecastHTML = wx.daily.time.map((date, i) => {
      const dayName = i === 0 ? 'Today' : DAYS[new Date(date).getDay()];
      const f = wmo(wx.daily.weather_code[i]);
      return `
        <div class="fc-day">
          <div class="fc-name">${dayName}</div>
          <div class="fc-icon">${f.icon}</div>
          <div class="fc-max">${Math.round(wx.daily.temperature_2m_max[i])}°</div>
          <div class="fc-min">${Math.round(wx.daily.temperature_2m_min[i])}°</div>
        </div>`;
    }).join('');

    const resultEl = document.getElementById('result');
    resultEl.innerHTML = `
      <div class="card card-location">
        <img class="loc-flag" src="${c.flags.png}" alt="Flag of ${country}" />
        <div class="loc-info">
          <div class="card-title">Destination</div>
          <h2>${name}, ${country}</h2>
          <div class="loc-meta">
            <span>${capital}</span>
            <span>${c.region}</span>
            <span>${c.population.toLocaleString()} people</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Current Weather</div>
        <div class="weather-top">
          <div class="w-icon">${w.icon}</div>
          <div>
            <div class="w-temp">${Math.round(cur.temperature_2m)}°C</div>
            <div class="w-desc">${w.desc}</div>
          </div>
        </div>
        <div class="stat-grid">
          <div class="stat">
            <div class="stat-label">Feels like</div>
            <div class="stat-val">${Math.round(cur.apparent_temperature)}°C</div>
          </div>
          <div class="stat">
            <div class="stat-label">Humidity</div>
            <div class="stat-val">${cur.relative_humidity_2m}%</div>
          </div>
          <div class="stat">
            <div class="stat-label">Wind</div>
            <div class="stat-val">${Math.round(cur.wind_speed_10m)} km/h</div>
          </div>
          <div class="stat">
            <div class="stat-label">Timezone</div>
            <div class="stat-val sm">${wx.timezone.replace(/_/g, ' ')}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Country Info</div>
        <div class="country-grid">
          <div class="stat">
            <div class="stat-label">Capital</div>
            <div class="stat-val sm">${capital}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Region</div>
            <div class="stat-val sm">${c.region}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Population</div>
            <div class="stat-val sm">${c.population.toLocaleString()}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Area</div>
            <div class="stat-val sm">${area}</div>
          </div>
          <div class="stat" style="grid-column:1/-1">
            <div class="stat-label">Currency</div>
            <div class="stat-val sm">${currencies}</div>
          </div>
          <div class="stat" style="grid-column:1/-1">
            <div class="stat-label">Languages</div>
            <div class="stat-val sm">${languages}</div>
          </div>
        </div>
      </div>

      <div class="card card-forecast">
        <div class="card-title">7-Day Forecast</div>
        <div class="forecast-scroll">
          <div class="forecast-row">${forecastHTML}</div>
        </div>
      </div>
    `;

    setLoading(false);
    resultEl.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('main').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  }
}

/* ── Init ───────────────────────────────────────── */
document.getElementById('cityInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') getTravelInfo();
});
