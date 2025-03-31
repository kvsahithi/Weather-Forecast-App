const apiKey = "9dff6354e13424cceeb90f570e993fcc";
const dropdown = document.getElementById("recentDropdown");
const cityInput = document.getElementById("cityName");
const recentCitiesList = document.getElementById("recentCitiesList");
let forecastResult = document.getElementById("forecastResult");

async function getWeather() {
  let city = cityInput.value.trim();
  if (!city) {
    alert("enter a city name");
  }
  fetchWeather(city);
  saveToRecentCities(city);
}
function getWeatherByCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCords(latitude, longitude);
      },
      () => {
        alert("Location access denied. Please enter a city name manually");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

async function fetchWeatherByCords(lat, long) {
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}&units=metric`;
  fetchWeatherData(apiUrl);
}
async function fetchWeather(city) {
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetchWeatherData(apiUrl);

  let forecastApi = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  fetchWeatherForecast(forecastApi);
}

async function fetchWeatherData(api) {
  let response = await fetch(api);
  let data = await response.json();
  displayWeather(data);
}

async function fetchWeatherForecast(forecastApi) {
  let response = await fetch(forecastApi);
  let data = await response.json();
  displayForecast(data);
}

function displayWeather(data) {
  const weatherCondition = data.weather[0].main;
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

  document.getElementById(
    "weatherResult"
  ).innerHTML = `<div><p><strong>${data.name}</strong></p>
  <p>Temperatue: ${data.main.temp}&deg;C</p>
  <p>Wind: ${data.wind.speed}M/S</p>
  <p>Humidity: ${data.main.humidity}%</p></div>
  <img src="${iconUrl}" alt="${weatherCondition}" class="w-52 mx-auto">
`;
}

function saveToRecentCities(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
}

cityInput.addEventListener("input", () => {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  let typedcity = cityInput.value.toLowerCase();

  let matchingCities = cities.filter((city) =>
    city.toLowerCase().startsWith(typedcity)
  );

  recentCitiesList.innerHTML = "";

  if (matchingCities.length > 0) {
    matchingCities.forEach((city) => {
      let listitem = document.createElement("li");
      listitem.textContent = city;
      listitem.className = "text-black pr-4 h-10 border";
      listitem.addEventListener("click", () => {
        cityInput.value = city;
        dropdown.classList.add("hidden");
      });
      recentCitiesList.append(listitem);
    });
    dropdown.classList.remove("hidden");
  } else {
    dropdown.classList.add("hidden");
  }
});

function displayForecast(data) {
  let currentTime = new Date().getHours();
  let forecastData = [];
  if (!data.list) {
    console.error("Forecast data does not contain 'list'.", data);
    return;
  }
  let selectedDates = new Set();
  data.list.forEach((entry) => {
    let entryDate = entry.dt_txt.split(" ")[0];
    let forecastTime = new Date(entry.dt_txt).getHours();
    if (
      selectedDates.size < 5 &&
      !selectedDates.has(entryDate) &&
      (forecastTime === 12 || forecastData.length < 5)
    ) {
      forecastData.push({
        date: entry.dt_txt.split(" ")[0],
        temp: entry.main.temp,
        wind: entry.wind.speed,
        humidity: entry.main.humidity,
        iconCode: entry.weather[0].icon,
      });
      selectedDates.add(entryDate);
    }
  });

  forecastResult.innerHTML = `<h2 class="text-2xl underline text-white font-bold my-4">5-day forecast</h2>`;
  let forecastHTML = "";
  forecastData.forEach((forecast) => {
    let icon = `https://openweathermap.org/img/wn/${forecast.iconCode}@4x.png`;
    forecastHTML += `
    <div class="bg-[#1e2934] text-center p-4 rounded-xl w-52 shadow-lg border mb-6">
     <p class="text-md font-semibold">${forecast.date}</p>
     <p>Temperature: ${forecast.temp}&deg;C</p>
     <p>wind: ${forecast.wind}M/S</p>
     <p>humidity: ${forecast.humidity}%</p>
     <img src="${icon}">
    </div>
    `;
  });

  forecastResult.innerHTML += forecastHTML;
}
