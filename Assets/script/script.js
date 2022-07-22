// API Key
var apiKey = '3ab030652d1b737b1ceeaf95fccacc9e'

var city = '';
var fiveDayForecastEl = $('.fiveDayForecast');

// Use MomentJS to grab current date and time in the desired format
var date = moment().format('dddd, MMMM Do YYYY');
var dateTime = moment().format('YYYY-MM-DD HH:MM:SS')

// Save Search History to an empty array to be saved to Local Storage
var searchHistory = [];

$('.search').on("click", function (event) {
    event.preventDefault();
    // Grab the city being searched with searchTerm ID
    city = $('#searchTerm').val();
    console.log(city);

    // Must Enter a city
    if (!city) {
        window.alert('Please enter a city');
        return;
    };

    // Push city into searchHistory array
    searchHistory.push(city);

    // Push searchTerm to searchHistory and to Local Storage
    localStorage.setItem('city', JSON.stringify(searchHistory));

    // Empty the current fiveDayForecastEl 
    fiveDayForecastEl.empty();
    getHistory();
    getWeatherToday();

});

// Function to create buttons based on searchHistory
var contHistEl = $('.searchHistory');
function getHistory() {
    contHistEl.empty();

    for (let i = 0; i < searchHistory.length; i++) {
        var rowEl = $('<row>');
        var btnEl = $('<button>').text(`${searchHistory[i]}`);

        rowEl.addClass('row histBtnRow');
        btnEl.addClass('btn btn-outline-secondary histBtn');
        btnEl.attr('type', 'button');

        contHistEl.append(rowEl);
        rowEl.append(btnEl);
    } if (!city) {
        return;
    }

    // Clicking on button start a search 
    $('.histBtn').on("click", function (event){
        event.preventDefault();

        city = $(this).text();
        fiveDayForecastEl.empty();
        getWeatherToday();
    });
}

// Grab the Card Body and Apply weather data to the card body
var cardToday = $('.cardBodyToday')
function getWeatherToday() {
    var requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    $(cardToday).empty();

    $.ajax({
        url: requestURL,
        method: 'GET',
    }).then(function (response) {
        $('.cardCityName').text(response.name);
        $('.cardTodayDate').text(date);
        // Icons
        $('.icons').attr('src', `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`);
        // Variables for card body (temp, windspeed, humidity)
        var temp = $('<p>').text(`Temperature: ${response.main.temp} °C`);
        var wind = $('<p>').text(`Windspeed: ${response.wind.speed} Km/hr`);
        var humidity = $('<p>').text(`Humidity Index ${response.main.humidity} %`);
        var lat = response.coord.lat;
        var lon = response.coord.lon;

        // Append variables to card body
        cardToday.append(temp);
        cardToday.append(wind);
        cardToday.append(humidity);

        var requestUviURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        $.ajax({
            url: requestUviURL,
            method: 'GET',
        }).then(function (response){
            // get UVI index and append current UVI value to it, then append it to card body
            var uviPIndex = $('<p>').text(`UV Index: `);
            var uviSpan = $('<span>').text(response.current.uvi);
            uviPIndex.append(uviSpan);
            cardToday.append(uviPIndex);

            // Set the correct colour for UVI Severity 
            var currentUVI = response.current.uvi
            if (currentUVI >=0 && currentUVI <=2) {
                uviPIndex.addClass('green');
            } else if (currentUVI >2 && currentUVI <=5) {
                uviPIndex.addClass('yellow');
            } else if (currentUVI >5 && currentUVI <=7) {
                uviPIndex.addClass('orange');
            } else if (currentUVI > 7 && currentUVI <= 10) {
                uviPIndex.addClass('red');
            } else {
                uviPIndex.addClass('purple');
            }
        });
    });
    // Execute function for five day weather forecast
    getForecast();
}

var forecastEl = $('.fiveDayForecast');

function getForecast() {
    requestURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`

    $.ajax({
        url: requestURL,
        method: 'GET'
    }).then(function (response){
        forecastArray = response.list;
        var weather = [];

        $.each(forecastArray, function (index, value) {
            dayCard = {
                // Split date and time from dt_txt in API call
                date: value.dt_txt.split(' ')[0],
                time: value.dt_txt.split(' ')[1],
                temp: value.main.temp,
                icon: value.weather[0].icon,
                humidity: value.main.humidity
            }

            // Inject dayCard if time is noon to weather
            if (value.dt_txt.split(' ')[1] === "12:00:00") {
                weather.push(dayCard)
            }
        })

        // Place Cards on the screen

        for (let i=0; i < weather.length; i++) {
            var divElCard = $('<div>');
			divElCard.attr('class', 'card text-white bg-primary mb-3 cardOne');
			divElCard.attr('style', 'max-width: 200px;');
			fiveDayForecastEl.append(divElCard);

			var divElHeader = $('<div>');
			divElHeader.attr('class', 'card-header')
			var m = moment(`${weather[i].date}`).format('MM-DD-YYYY');
			divElHeader.text(m);
			divElCard.append(divElHeader)

			var divElBody = $('<div>');
			divElBody.attr('class', 'card-body');
			divElCard.append(divElBody);

			var divElIcon = $('<img>');
			divElIcon.attr('class', 'icons');
			divElIcon.attr('src', `https://openweathermap.org/img/wn/${weather[i].icon}@2x.png`);
			divElBody.append(divElIcon);

            //Temp
			var pElTemp = $('<p>').text(`Temperature: ${weather[i].temp} °C`);
			divElBody.append(pElTemp);

			//Humidity
			var pElHumid = $('<p>').text(`Humidity: ${weather[i].humidity} %`);
			divElBody.append(pElHumid);
        }
    });
};
