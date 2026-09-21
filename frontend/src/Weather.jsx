import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Weather.css";

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

const COMMON_LOCATION_FIXES = {
  bengalore: "Bengaluru",
  banglore: "Bengaluru",
  bangalore: "Bengaluru",
  bombay: "Mumbai",
  calcutta: "Kolkata",
  madras: "Chennai",
  poona: "Pune",
  hydrabad: "Hyderabad",
  hyderabad: "Hyderabad",
};

const WEATHER_CODES = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  56: ["Freezing drizzle", "🌧️"],
  57: ["Heavy freezing drizzle", "🌧️"],
  61: ["Light rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  66: ["Freezing rain", "🌧️"],
  67: ["Heavy freezing rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "🌨️"],
  80: ["Rain showers", "🌦️"],
  81: ["Rain showers", "🌧️"],
  82: ["Heavy rain showers", "⛈️"],
  85: ["Snow showers", "🌨️"],
  86: ["Heavy snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Thunderstorm with heavy hail", "⛈️"],
};

function weatherCode(code, labels = {}) {
  const [description, icon] = WEATHER_CODES[Number(code)] || [labels.weatherVariable || "Variable conditions", "🌤️"];
  const key = `weather${Number(code)}`;
  return [labels[key] || description, icon];
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
  });
}

function formatLongDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function locationLabel(place) {
  if (!place) return "";
  return [
    place.name,
    place.admin1,
    place.country,
  ].filter(Boolean).filter((value, index, arr) => arr.indexOf(value) === index).join(", ");
}

function getSuggestionData(history = []) {
  const recent = Array.isArray(history) ? history.slice(0, 12) : [];
  const crops = [...new Set(recent.map((item) => item?.crop).filter(Boolean))];
  const problems = recent.map((item) => String(item?.diagnosis || "").toLowerCase());

  return {
    crops,
    hasFungalRiskHistory: problems.some((p) =>
      /mildew|blight|anthrac|rot|rust|fungal|leaf spot|scab/.test(p)
    ),
    hasPestHistory: recent.some((item) =>
      String(item?.problem_type || "").toLowerCase() === "pest"
    ),
  };
}

export default function Weather({ history = [], labels = {} }) {
  const label = (key, fallback) => labels[key] || fallback;
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [weather, setWeather] = useState(null);

  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");

  const debounceRef = useRef(null);

  const farmData = useMemo(() => getSuggestionData(history), [history]);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);

        const normalized =
          COMMON_LOCATION_FIXES[trimmed.toLowerCase()] || trimmed;

        const params = new URLSearchParams({
          name: normalized,
          count: "6",
          language: "en",
          format: "json",
          countryCode: "IN",
        });

        const response = await fetch(`${GEO_URL}?${params}`);
        if (!response.ok) throw new Error("Location search failed.");

        const data = await response.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error("Location search error:", err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const fetchWeather = async (place) => {
    if (!place?.latitude || !place?.longitude) return;

    setWeatherLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        latitude: String(place.latitude),
        longitude: String(place.longitude),
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "precipitation",
          "weather_code",
          "wind_speed_10m",
          "wind_gusts_10m",
          "cloud_cover",
        ].join(","),
        daily: [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "precipitation_sum",
          "precipitation_probability_max",
          "wind_speed_10m_max",
          "relative_humidity_2m_max",
          "relative_humidity_2m_min",
          "et0_fao_evapotranspiration",
          "sunrise",
          "sunset",
        ].join(","),
        timezone: "auto",
        forecast_days: "7",
        temperature_unit: "celsius",
        wind_speed_unit: "kmh",
        precipitation_unit: "mm",
      });

      const response = await fetch(`${WEATHER_URL}?${params}`);
      if (!response.ok) throw new Error("Unable to load weather.");

      const data = await response.json();

      setSelectedPlace(place);
      setQuery(place.name || "");
      setSuggestions([]);
      setWeather(data);
    } catch (err) {
      console.error("Weather error:", err);
      setError("Unable to load weather for this location. Please try again.");
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          let place = {
            name: "Selected location",
            latitude,
            longitude,
            country: "India",
          };

          try {
            const reverseParams = new URLSearchParams({
              latitude: String(latitude),
              longitude: String(longitude),
              localityLanguage: "en",
            });

            const reverseResponse = await fetch(
              `${REVERSE_URL}?${reverseParams}`
            );

            if (reverseResponse.ok) {
              const reverse = await reverseResponse.json();

              place = {
                name:
                  reverse.city ||
                  reverse.locality ||
                  reverse.principalSubdivision ||
                  "Selected location",
                admin1: reverse.principalSubdivision,
                country: reverse.countryName || "India",
                latitude,
                longitude,
              };
            }
          } catch (reverseError) {
            console.warn("Reverse geocoding unavailable:", reverseError);
          }

          await fetchWeather(place);
        } catch (err) {
          console.error(err);
          setError("Unable to use your current location.");
        } finally {
          setLocationLoading(false);
        }
      },
      (geoError) => {
        console.error(geoError);
        setLocationLoading(false);

        if (geoError.code === 1) {
          setError("Location permission was denied. Please allow location access.");
        } else {
          setError("Unable to determine your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Enter a city or location first.");
      return;
    }

    if (suggestions.length > 0) {
      await fetchWeather(suggestions[0]);
      return;
    }

    const normalized =
      COMMON_LOCATION_FIXES[query.trim().toLowerCase()] || query.trim();

    try {
      setWeatherLoading(true);
      setError("");

      const params = new URLSearchParams({
        name: normalized,
        count: "1",
        language: "en",
        format: "json",
        countryCode: "IN",
      });

      const response = await fetch(`${GEO_URL}?${params}`);
      const data = await response.json();

      if (!data.results?.length) {
        setError(`We couldn't find "${query}". Select a suggested location.`);
        return;
      }

      await fetchWeather(data.results[0]);
    } catch (err) {
      console.error(err);
      setError("Unable to find that location.");
    } finally {
      setWeatherLoading(false);
    }
  };

  const suggestionsForWeather = useMemo(() => {
    if (!weather?.daily?.time) return [];

    const days = weather.daily.time;
    const rain = weather.daily.precipitation_probability_max || [];
    const humidity = weather.daily.relative_humidity_2m_max || [];
    const wind = weather.daily.wind_speed_10m_max || [];
    const maxTemp = weather.daily.temperature_2m_max || [];

    const alerts = [];

    if ((rain[0] || 0) >= 70) {
      alerts.push({
        level: "warning",
        icon: "🌧️",
        title: label("rainLikely", "Rain likely"),
        text: `${label("rainProbability", "Rain probability is")} ${rain[0]}% ${label("today", "today")}. ${label("protectProduce", "Avoid unnecessary irrigation and protect harvested produce.")}`,
      });
    }

    if ((humidity[0] || 0) >= 80 || farmData.hasFungalRiskHistory) {
      alerts.push({
        level: "warning",
        icon: "🍃",
        title: label("fungalRisk", "Fungal-risk conditions"),
        text: farmData.hasFungalRiskHistory
          ? label("fungalHistory", "Your recent crop records include disease problems, and humid conditions can increase leaf-wetness and fungal pressure. Inspect affected crops closely.")
          : label("fungalHumidity", "High humidity can keep leaves wet for longer. Increase monitoring for fungal symptoms and improve airflow where possible."),
      });
    }

    if ((maxTemp[0] || 0) >= 35) {
      alerts.push({
        level: "danger",
        icon: "☀️",
        title: label("heatStress", "Heat stress watch"),
        text: `${label("maxTemperature", "Today's maximum temperature may reach")} ${Math.round(maxTemp[0])}°C. ${label("soilMoisture", "Check soil moisture and plan irrigation around the cooler part of the day.")}`,
      });
    }

    if ((wind[0] || 0) >= 30) {
      alerts.push({
        level: "warning",
        icon: "💨",
        title: label("strongWind", "Strong wind"),
        text: `${label("windMayReach", "Wind may reach")} ${Math.round(wind[0])} km/h. ${label("avoidSpraying", "Avoid spraying during strong winds and secure vulnerable plants.")}`,
      });
    }

    if ((rain.slice(0, 3).some((value) => value >= 60))) {
      alerts.push({
        level: "info",
        icon: "🚜",
        title: label("planFieldWork", "Plan field work"),
        text: label("fieldWorkText", "Several of the next few days show elevated rain probability. Schedule spraying, harvesting and soil work during the clearest window."),
      });
    }

    if (farmData.hasPestHistory && (maxTemp[0] || 0) >= 28 && (humidity[0] || 0) >= 65) {
      alerts.push({
        level: "info",
        icon: "🐛",
        title: label("pestMonitoring", "Pest monitoring"),
        text: label("pestMonitoringText", "Warm and humid conditions can support pest activity. Check the undersides of leaves and new growth during your next field inspection."),
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        level: "good",
        icon: "🌱",
        title: label("goodPlanning", "Good planning window"),
        text: label("goodPlanningText", "No major weather-based warning was detected for today. Continue routine crop monitoring and use the forecast to plan field work."),
      });
    }

    return alerts.slice(0, 5);
  }, [weather, farmData]);

  return (
    <section className="weather-page">
      <div className="weather-container">
        <div className="weather-hero">
          <div>
            <p className="weather-kicker">AGROMITR WEATHER INTELLIGENCE</p>
            <h1>{labels.weatherTitle || "Plan your farm around the weather."}</h1>
            <p className="weather-subtitle">
              {labels.weatherSubtitle || "Check local conditions, forecasted rain, heat and wind, then turn them into practical farm preparation steps."}
            </p>
          </div>

          <div className="weather-hero-icon">🌦️</div>
        </div>

        <div className="weather-search-card">
          <div className="weather-search-row">
            <div className="weather-input-wrap">
              <span>🔎</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch();
                }}
                placeholder={labels.searchLocation || "Search your farm city or location"}
                aria-label={labels.searchLocation || "Search weather location"}
              />
              {loadingSuggestions && (
                <span className="weather-input-status">{label("searchingWeather", "Searching...")}</span>
              )}
            </div>

            <button
              type="button"
              className="weather-primary-button"
              onClick={handleSearch}
              disabled={weatherLoading}
            >
              {weatherLoading ? label("checkingWeather", "Checking...") : labels.checkWeather || "Check Weather"}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="weather-suggestions">
              {suggestions.map((place) => (
                <button
                  type="button"
                  key={`${place.id}-${place.latitude}-${place.longitude}`}
                  onClick={() => fetchWeather(place)}
                  className="weather-suggestion"
                >
                  <span className="suggestion-pin">📍</span>
                  <span>
                    <strong>{place.name}</strong>
                    <small>
                      {[place.admin1, place.country]
                        .filter(Boolean)
                        .join(", ")}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className="current-location-button"
            onClick={useCurrentLocation}
            disabled={locationLoading}
          >
            📍 {locationLoading ? label("findingLocation", "Finding your location...") : labels.currentLocation || "Use my current location"}
          </button>

          {error && <div className="weather-error">⚠️ {error}</div>}
        </div>

        {weather && (
          <>
            <div className="weather-location-heading">
              <div>
                <span>{label("farmLocation", "FARM LOCATION")}</span>
                <h2>{locationLabel(selectedPlace)}</h2>
                <p>
                  Forecast updated for the local timezone · {weather.timezone}
                </p>
              </div>

              <button
                type="button"
                className="weather-refresh"
                onClick={() => fetchWeather(selectedPlace)}
                disabled={weatherLoading}
              >
                ↻ {label("refresh", "Refresh")}
              </button>
            </div>

            <div className="weather-current-card">
              <div className="weather-current-main">
                <div className="weather-current-icon">
                  {weatherCode(weather.current?.weather_code, labels)[1]}
                </div>
                <div>
                  <p>{label("rightNow", "RIGHT NOW")}</p>
                  <div className="weather-temperature">
                    {Math.round(weather.current?.temperature_2m ?? 0)}
                    <span>°C</span>
                  </div>
                  <strong>{weatherCode(weather.current?.weather_code, labels)[0]}</strong>
                  <small>
                    Feels like {Math.round(weather.current?.apparent_temperature ?? 0)}°C
                  </small>
                </div>
              </div>

              <div className="weather-metrics">
                <div>
                  <span>💧</span>
                  <strong>{weather.current?.relative_humidity_2m ?? 0}%</strong>
                    <small>{label("humidity", "Humidity")}</small>
                </div>
                <div>
                  <span>💨</span>
                  <strong>{Math.round(weather.current?.wind_speed_10m ?? 0)}</strong>
                    <small>km/h {label("wind", "wind")}</small>
                </div>
                <div>
                  <span>🌧️</span>
                  <strong>{weather.current?.precipitation ?? 0}</strong>
                    <small>mm {label("rain", "rain")}</small>
                </div>
                <div>
                  <span>☁️</span>
                  <strong>{weather.current?.cloud_cover ?? 0}%</strong>
                    <small>{label("cloudCover", "Cloud cover")}</small>
                </div>
              </div>
            </div>

            <div className="weather-section-card">
              <div className="weather-section-heading">
                <div>
                  <p>{label("forecast", "FORECAST")}</p>
                  <h2>{label("outlook", "7-day farm outlook")}</h2>
                </div>
                <span>🌱 {label("farmPlanning", "Farm planning")}</span>
              </div>

              <div className="forecast-grid">
                {weather.daily.time.map((date, index) => {
                  const [description, icon] = weatherCode(
                    weather.daily.weather_code?.[index],
                    labels
                  );

                  return (
                    <div className="forecast-card" key={date}>
                      <strong>{index === 0 ? label("today", "Today") : formatDate(date)}</strong>
                      <span className="forecast-icon">{icon}</span>
                      <small>{description}</small>

                      <div className="forecast-temperatures">
                        <b>
                          {Math.round(weather.daily.temperature_2m_max?.[index] ?? 0)}°
                        </b>
                        <span>
                          {Math.round(weather.daily.temperature_2m_min?.[index] ?? 0)}°
                        </span>
                      </div>

                      <div className="forecast-rain">
                        🌧️ {weather.daily.precipitation_probability_max?.[index] ?? 0}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="weather-planning-grid">
              <div className="weather-section-card planning-card">
                <div className="weather-section-heading">
                  <div>
                    <p>{label("advisory", "AGROMITR ADVISORY")}</p>
                    <h2>{label("prepare", "What should you prepare for?")}</h2>
                  </div>
                  <span>{farmData.crops.length ? `${farmData.crops.length} ${label("cropsTracked", "crops tracked")}` : label("generalFarmPlan", "General farm plan")}</span>
                </div>

                <div className="advisory-list">
                  {suggestionsForWeather.map((item, index) => (
                    <div className={`advisory-item ${item.level}`} key={`${item.title}-${index}`}>
                      <div className="advisory-item-icon">{item.icon}</div>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="weather-section-card weather-details-card">
                <p className="weather-card-kicker">{label("nextFieldWindow", "NEXT FIELD WINDOW")}</p>
                <h2>{label("planBeforeAct", "Plan before you act.")}</h2>

                <div className="planning-check">
                  <span>🌧️</span>
                  <div>
                    <strong>{label("rain", "Rain")}</strong>
                    <small>
                      {weather.daily.precipitation_probability_max?.[0] ?? 0}% {label("today", "today")} ·{" "}
                      {weather.daily.precipitation_sum?.[0] ?? 0} mm forecast
                    </small>
                  </div>
                </div>

                <div className="planning-check">
                  <span>🌡️</span>
                  <div>
                    <strong>{label("temperature", "Temperature")}</strong>
                    <small>
                      {Math.round(weather.daily.temperature_2m_min?.[0] ?? 0)}°–{Math.round(weather.daily.temperature_2m_max?.[0] ?? 0)}°C {label("today", "today")}
                    </small>
                  </div>
                </div>

                <div className="planning-check">
                  <span>💨</span>
                  <div>
                    <strong>{label("wind", "Wind")}</strong>
                    <small>
                      {label("upTo", "Up to")} {Math.round(weather.daily.wind_speed_10m_max?.[0] ?? 0)} km/h {label("today", "today")}
                    </small>
                  </div>
                </div>

                <div className="planning-date">
                  {label("forecastFor", "Forecast for")} {formatLongDate(weather.daily.time?.[0])}
                </div>
              </div>
            </div>

            <p className="weather-disclaimer">
              {label("forecastDisclaimer", "Weather data is forecast information. Use local agricultural guidance and field observations before making high-impact treatment decisions.")}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
