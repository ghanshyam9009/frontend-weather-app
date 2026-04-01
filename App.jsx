import { useEffect, useState } from "react";

const API_BASE_URL = "https://backend-weather-app-anda.onrender.com";

const themeMap = {
  clear: {
    accent: "linear-gradient(135deg, #f8d66d 0%, #f07b3f 100%)",
    panel: "rgba(73, 36, 5, 0.15)",
    text: "#fff9f0",
  },
  cloudy: {
    accent: "linear-gradient(135deg, #7f9cf5 0%, #4a5568 100%)",
    panel: "rgba(12, 25, 45, 0.26)",
    text: "#eef4ff",
  },
  rainy: {
    accent: "linear-gradient(135deg, #1d4350 0%, #4ca1af 100%)",
    panel: "rgba(7, 30, 43, 0.28)",
    text: "#effbff",
  },
  stormy: {
    accent: "linear-gradient(135deg, #232526 0%, #414345 100%)",
    panel: "rgba(0, 0, 0, 0.4)",
    text: "#f5f7fa",
  },
  snowy: {
    accent: "linear-gradient(135deg, #c9d6ff 0%, #e2e2e2 100%)",
    panel: "rgba(255, 255, 255, 0.22)",
    text: "#17324d",
  },
  humid: {
    accent: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    panel: "rgba(8, 71, 56, 0.25)",
    text: "#f4fff8",
  },
  cold: {
    accent: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    panel: "rgba(2, 37, 75, 0.25)",
    text: "#effaff",
  },
  hot: {
    accent: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)",
    panel: "rgba(84, 8, 26, 0.26)",
    text: "#fff2f5",
  },
};

const formatTimestamp = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getIconUrl = (iconPath) => {
  if (!iconPath) return "";
  return iconPath.startsWith("//") ? `https:${iconPath}` : iconPath;
};

function App() {
  const [query, setQuery] = useState("Mumbai");
  const [weatherData, setWeatherData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentCategory = weatherData?.weather?.category || "clear";
  const theme = themeMap[currentCategory] || themeMap.clear;

  const fetchRecentSearches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recent`);
      const data = await response.json();
      setRecentSearches(data);
    } catch (err) { console.error(err); }
  };

  const fetchWeather = async (searchValue) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}?query=${encodeURIComponent(searchValue)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "City not found");
      setWeatherData(data);
      fetchRecentSearches();
    } catch (err) {
      setWeatherData(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather("Mumbai");
    fetchRecentSearches();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (query.trim()) fetchWeather(query.trim());
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .app-shell {
          height: 100dvh;
          min-height: 100dvh;
          width: 100%;
          background: ${theme.accent};
          color: ${theme.text};
          transition: background 1.5s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: stretch;
          padding: clamp(1rem, 2vw, 2rem);
        }

        /* --- WEATHER ENGINE LAYERS --- */
        .weather-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        /* 1. RAIN & STORM EFFECTS */
        .app-shell[data-weather="rainy"] .weather-layer,
        .app-shell[data-weather="stormy"] .weather-layer {
          background: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
          opacity: 0.3;
          animation: rainEffect 0.4s linear infinite;
        }

        /* 2. CLOUDY & MIST EFFECTS */
        .app-shell[data-weather="cloudy"] .weather-layer,
        .app-shell[data-weather="humid"] .weather-layer {
          background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
          filter: blur(50px);
          animation: cloudDrift 20s linear infinite alternate;
        }

        /* 3. SNOW EFFECTS */
        .app-shell[data-weather="snowy"] .weather-layer::before {
          content: "❄ ❄ ❄ ❄ ❄";
          position: absolute;
          top: -50px;
          width: 100%;
          text-align: center;
          font-size: 3rem;
          color: white;
          opacity: 0.5;
          animation: snowFall 10s linear infinite;
          text-shadow: 400px 600px 0 #fff, -300px 400px 0 #fff, 200px 800px 0 #fff;
        }

        /* 4. HEAT SHIMMER */
        .app-shell[data-weather="hot"] .hero-card {
          animation: heatHaze 4s ease-in-out infinite;
        }

        /* --- KEYFRAMES --- */
        @keyframes rainEffect { from { background-position: 0 0; } to { background-position: 40px 400px; } }
        @keyframes snowFall { from { transform: translateY(0); } to { transform: translateY(100vh); } }
        @keyframes cloudDrift { 
          0% { transform: scale(1) translate(-10%, -10%); } 
          100% { transform: scale(1.5) translate(10%, 10%); } 
        }
        @keyframes heatHaze {
          0%, 100% { filter: brightness(1) contrast(1); transform: scale(1); }
          50% { filter: brightness(1.05) contrast(1.1) blur(0.5px); transform: scale(1.005); }
        }

        /* --- UI COMPONENTS --- */
        .hero-card {
          width: 100%;
          max-width: 1100px;
          height: 100%;
          min-height: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          overflow-y: auto;
          padding-right: 0.35rem;
          scrollbar-gutter: stable;
        }

        .weather-panel {
          background: ${theme.panel};
          backdrop-filter: blur(25px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 30px;
          padding: 2.5rem;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }

        .search-panel {
          background: rgba(255, 255, 255, 0.1);
          padding: 1.5rem 2rem;
          border-radius: 20px;
        }

        .search-row { display: flex; gap: 1rem; margin-top: 0.5rem; }

        input {
          flex: 1;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 1rem 1.5rem;
          border-radius: 15px;
          color: white;
          font-size: 1rem;
          outline: none;
        }

        button {
          background: ${theme.text};
          color: #000;
          border: none;
          padding: 1rem 2rem;
          border-radius: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
        }

        button:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }

        .content-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; }

        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 1rem; 
          margin-top: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 1.2rem;
          border-radius: 18px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .weather-badge {
          background: rgba(255,255,255,0.2);
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .recent-item {
          width: 100%;
          display: flex;
          justify-content: space-between;
          background: rgba(0,0,0,0.1);
          border: none;
          color: inherit;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 0.8rem;
          cursor: pointer;
          transition: 0.2s;
        }

        .recent-item:hover { background: rgba(255,255,255,0.1); }

        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <main className="app-shell" data-weather={currentCategory}>
        <div className="weather-layer" />
        
        <section className="hero-card">
          <div className="hero-copy">
            <p style={{ letterSpacing: '3px', fontWeight: 'bold', fontSize: '0.8rem', opacity: 0.7 }}>MERN LIVE WEATHER</p>
            <h1 style={{ fontSize: '3rem', margin: '0.5rem 0' }}>Atmospheric Intelligence</h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>{weatherData ? `${weatherData.location.label} is ${weatherData.weather.temperature}°C` : "Loading..."}</p>
          </div>

          <form className="search-panel" onSubmit={handleSubmit}>
            <label style={{ fontSize: '0.9rem' }}>Search Destination</label>
            <div className="search-row">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="London, Tokyo, Mumbai..."
              />
              <button type="submit" disabled={loading}>{loading ? "..." : "Update"}</button>
            </div>
            {error && <p style={{ color: '#ff4d4d', marginTop: '10px' }}>{error}</p>}
          </form>

          <div className="content-grid">
            <article className="weather-panel main-panel">
              {weatherData && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem' }}>{weatherData.location.label}</h2>
                      <h3 style={{ fontSize: '5rem', margin: '1rem 0' }}>{weatherData.weather.temperature}°</h3>
                      <p className="weather-badge">{weatherData.weather.description}</p>
                    </div>
                    <img 
                      src={getIconUrl(weatherData.weather.icon)} 
                      className="weather-icon" 
                      style={{ width: '120px', height: '120px' }}
                      alt="icon" 
                    />
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card"><small>Humidity</small><br/><strong>{weatherData.weather.humidity}%</strong></div>
                    <div className="stat-card"><small>Wind</small><br/><strong>{weatherData.weather.windSpeed}m/s</strong></div>
                    <div className="stat-card"><small>Feels Like</small><br/><strong>{weatherData.weather.feelsLike}°</strong></div>
                    <div className="stat-card"><small>Pressure</small><br/><strong>{weatherData.weather.pressure}</strong></div>
                    <div className="stat-card"><small>Min</small><br/><strong>{weatherData.weather.tempMin}°</strong></div>
                    <div className="stat-card"><small>Max</small><br/><strong>{weatherData.weather.tempMax}°</strong></div>
                  </div>
                </>
              )}
            </article>

            <aside className="weather-panel side-panel">
              <h4 style={{ marginBottom: '1.5rem' }}>Recent Searches</h4>
              {recentSearches.map((entry) => (
                <button key={entry._id} className="recent-item" onClick={() => fetchWeather(entry.query)}>
                  <strong>{entry.locationName}</strong>
                  <span>{entry.temperature}°C</span>
                </button>
              ))}
              <div style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6 }}>
                <p>System Logic: Active</p>
                {weatherData && <p>Last Sync: {formatTimestamp(weatherData.searchedAt)}</p>}
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
