
// NO POPUPS — errors are silently ignored

const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const locBtn = document.getElementById('locBtn');

const tempEl = document.getElementById('temp');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const pressureEl = document.getElementById('pressure');
const iconEl = document.getElementById('weatherIcon');
const placeEl = document.getElementById('place');
const descEl = document.getElementById('desc');

const aqiValEl = document.getElementById('aqiVal');
const aqiTextEl = document.getElementById('aqiText');

let map = L.map('map').setView([20.59,78.96],5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
let marker;

async function geocode(city){
  try{
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results[0];
  }catch{
    return null;
  }
}

async function fetchWeather(lat,lon){
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,pressure_msl,weather_code`;
  const res = await fetch(url);
  return await res.json();
}

async function fetchAQI(lat,lon){
  try{
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=us_aqi`;
    const res = await fetch(url);
    const data = await res.json();
    return data.hourly.us_aqi[0];
  }catch{
    return "--";
  }
}

function iconFromCode(code){
  if(code===0) return "assets/sun.svg";
  if(code<=3) return "assets/cloud.svg";
  return "assets/rain.svg";
}

async function updateCity(city){
  const g = await geocode(city);
  if(!g) return;

  const lat=g.latitude, lon=g.longitude;
  const w = await fetchWeather(lat,lon);
  const aqi = await fetchAQI(lat,lon);

  placeEl.textContent = g.name;
  tempEl.textContent = w.current.temperature_2m + "°C";
  humidityEl.textContent = w.current.relative_humidity_2m + "%";
  windEl.textContent = w.current.wind_speed_10m + " km/h";
  pressureEl.textContent = w.current.pressure_msl + " hPa";
  descEl.textContent = "Updated • Open-Meteo";

  iconEl.src = iconFromCode(w.current.weather_code);
  aqiValEl.textContent = aqi;
  aqiTextEl.textContent = "AQI: " + aqi;

  if(marker) marker.setLatLng([lat,lon]);
  else marker = L.marker([lat,lon]).addTo(map);
  marker.bindPopup(g.name).openPopup();

  map.setView([lat, lon], 10);
}

searchBtn.onclick = () => updateCity(cityInput.value.trim());
cityInput.onkeydown = (e) => {
  if(e.key === 'Enter') updateCity(cityInput.value.trim());
};

locBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat=pos.coords.latitude, lon=pos.coords.longitude;

    const w = await fetchWeather(lat,lon);
    const aqi = await fetchAQI(lat,lon);

    placeEl.textContent = "Your Location";
    tempEl.textContent = w.current.temperature_2m + "°C";
    humidityEl.textContent = w.current.relative_humidity_2m + "%";
    windEl.textContent = w.current.wind_speed_10m + " km/h";
    pressureEl.textContent = w.current.pressure_msl + " hPa";
    descEl.textContent = "Updated • Open-Meteo";

    iconEl.src = iconFromCode(w.current.weather_code);
    aqiValEl.textContent = aqi;
    aqiTextEl.textContent = "AQI: " + aqi;

    if(marker) marker.setLatLng([lat,lon]);
    else marker=L.marker([lat,lon]).addTo(map);
    marker.bindPopup("You").openPopup();
    map.setView([lat,lon],10);
  });
};
