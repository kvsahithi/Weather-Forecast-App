const apiKey = "9dff6354e13424cceeb90f570e993fcc";
const dropdown = document.getElementById("recentDropdown");
const cityInput = document.getElementById("cityName");
const recentCitiesList = document.getElementById("recentCitiesList");

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
}

async function fetchWeatherData(api) {
  let response = await fetch(api);
  let data = await response.json();
  displayWeather(data);
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
  <img src="${iconUrl}" alt="${weatherCondition}" class="w-20 h-20 mx-auto">
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
