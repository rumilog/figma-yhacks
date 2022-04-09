var currentCoords;
var map;
var textbox = document.getElementById("text");
const directionsInfo = document.getElementById("getDirections");
const directionsButton = document.getElementById("getDirections");
directionsButton.onclick = function() {
    directions();
}
let directionsService;
let directionsDisplay;

function initialize(lat, lon) {
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat, lon);
    var mapOptions = {
        zoom: 8,
        center: {
            lat: parseFloat(lat),
            lng: parseFloat(lon)
        }
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

function codeAddress() {
    var address = document.getElementById('start').value;
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == 'OK') {
            map.setCenter(results[0].geometry.location);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

async function directions() {
    let options = {};
    let origin = document.getElementById("start").value;
    let destination = document.getElementById("end").value;

    //If empty set to current location
    if (origin == "my location" || origin == "") {
        origin = currentCoords;
    }
    else {
        geocoder.geocode( { 'address': origin}, function(results, status) { //convert to lat/long
            if (status == 'OK') {
                origin = results[0].geometry.location;
            }
        });
    }
    if (destination == "my location" || destination == "") {
        destination = currentCoords;
    }
    else {
        geocoder.geocode( { 'address': destination}, function(results, status) {
            if (status == 'OK') {
                destination = results[0].geometry.location;
            }
        });
    }
    let directionsService = new google.maps.DirectionsService();
    let directionsDisplay = new google.maps.DirectionsRenderer();
    for (let i = 0; i < 4; i++) {
        let mode;
        if (i == 0) {
            mode = "BICYCLING";
        }
        if (i == 1) {
            mode = "DRIVING";
        }
        if (i == 2) {
            mode = "WALKING";
        }
        if (i == 3) {
            mode = "TRANSIT";
        }
        let request = {
            origin: origin,
            destination: destination,
            travelMode: mode //BICYCLING, DRIVING, WALKING, TRANSIT
        }
        directionsDisplay.setMap(map);
        directionsService.route(request, (result, status) => {
            if (status == "OK") {
                //directionsDisplay.setDirections(result);
                var point = result.routes[0].legs[0];
                options[mode] = point.duration.text;
            } else {
                options[mode] = ("n/a");
            }
        });
    }
    await sleep(2500); //Loading
    options = await textToTime(options);
    console.log(options);
    bestOption = await processResults(options);
    if (bestOption != "") {
        let request = {
            origin: origin,
            destination: destination,
            travelMode: bestOption
        }
        directionsDisplay.setMap(map);
        directionsService.route(request, (result, status) => {
            if (status == "OK") {
                directionsDisplay.setDirections(result);
            }
        });
    }
}

async function processResults(options) {
    var bestOption = "";
    if (options["BICYCLING"] == "-1" && options["DRIVING"] == "-1" && options["WALKING"] == "-1" && options["TRANSIT"] == "-1") {
        textbox.innerHTML = "No Routes Available.\nFun Fact: " + getRandomFunFact();
    }
    else if (options["WALKING"] <= 10) {
        bestOption = "WALKING";
        textbox.innerHTML = "I'd reccomend walking: Walking will take you about " + options["WALKING"] + " minutes. By walking as opposed to using a vehicle, you will be able to save about " + options["WALKING"] / 10 + " pounds of harmful CO2 emmisions from entering our atmosphere!\nFun Fact: " + getRandomFunFact();
    }
    else if (options["BICYCLING"] <= 15) {
        bestOption = "BICYCLING";
        textbox.innerHTML = "I'd reccomend biking: Biking will take you about " + options["BICYCLING"] + " minutes. By Biking as opposed to using a vehicle, you will be able to save about " + options["BICYCLING"] / 10 + " pounds of harmful CO2 emmisions from entering our atmosphere!\nFun Fact: " + getRandomFunFact();
    }
    else if (options["BICYCLING"] <= 30 && options["TRANSIT"] >= 23) {
        textbox.innerHTML = "I'd reccomend biking: Biking will take you about " + options["BICYCLING"] + " minutes. By Biking as opposed to using a vehicle, you will be able to save about " + options["BICYCLING"] / 10 + " pounds of harmful CO2 emmisions from entering our atmosphere!\nFun Fact: " + getRandomFunFact();
    }
    else if (options["TRANSIT"] < 30 && options["TRANSIT"] != -1) {
        bestOption = "TRANSIT";
        textbox.innerHTML = "I'd reccomend transit: Transit will take you about " + options["TRANSIT"] + " minutes.\nFun Fact: " + getRandomFunFact();
    } 
    else if (options["TRANSIT"] < options["DRIVING"] && options["TRANSIT"] != -1) {
        bestOption = "TRANSIT";
        textbox.innerHTML = "I'd reccomend transit: Transit will take you about " + options["TRANSIT"] + " minutes.\nFun Fact: " + getRandomFunFact();
    }
    else {
        bestOption = "DRIVING";
        textbox.innerHTML = "I'd reccomend driving: Driving will take you about " + options["DRIVING"] + " minutes. Although this is not the most environmentally friendly option, it makes the most sense for getting you to your destination.\nFun Fact: " + getRandomFunFact();
    }
    return bestOption;
}

//Converts the provided google times to a single integer
async function textToTime(result) {
    for (var key in result) {
        let total = 0;
        let current = result[key];
        if (current == "n/a") {
            total = -1;
        }
        else {
            var num = "";
            for (let i = 0; i < current.length; i++) {
                if ($.isNumeric(current.charAt(i))) {
                    num += current.charAt(i);
                }
                else {
                    if (current.charAt(i) == "h") {
                        total += 60 * parseInt(num);
                        num = "";
                    } 
                    if (current.charAt(i) == "m") {
                        total += parseInt(num);
                        num = "";
                    }
                }
            }
        }
        result[key] = total;
    }
    return result;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


//sets current location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (p) {
            currentCoords = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
            map.setCenter(currentCoords);
            var marker = new google.maps.Marker({
                position: currentCoords,
                title:"Current Position"
            });
            marker.setMap(map);
        }
    );
}

var funFacts = [
    "Air pollution causes up to 36,000 early deaths a year in the UK!",
    "The U.S. public transportation save 37 million metric tons of carbon dioxide annualy!",
    "Compared to driving, public transportation can reduce CO2 emmisions by 45%!",
    "Pollution is one of the biggest global killers, affecting over 100 million people. That’s comparable to global diseases like malaria and HIV!",
    "Over 1 million seabirds and 100,000 sea mammals are killed by pollution every year!",
    "Recycling and composting prevented 85 million tons of material away from being disposed of in 2010, up from 18 million tons in 1980!",
    "Every year, around one trillion gallons of untreated sewage and industrial waste is dumped in the U.S water!",
    "Composting and recycling alone have prevented 85 million tons of waste from being dumped in 2010!",
    "There are more than 500 million cars in the world, and by 2030 the number will rise to 1 billion. This means the pollution level will be more than double!",
    "A single-car generates half a ton of CO2, and a NASA space shuttle releases 28 tons of C02!",
    "World Health Organization (WHO) estimates 6400 people die every year in Mexico due to air pollution!",
    "A glass that is produced from recycled glass instead of raw materials can reduce related air pollution by 20% and water pollution by 50%!",
    "91% of the World’s Population Are Breathing in Polluted Air Every Day!",
    "Air Pollution Has A Nearly $3 Trillion Economic Cost, Equivalent to 3.3% of the World’s GDP!",
    "Motor vehicles are responsible for around 51% of carbon monoxide pollution!",
    "The exhaust system from cars release many gaseous constituents that cause more clouds and less rain, bringing a significant negative impact on the environment!",
    "Cars release approximately 333 million tons of carbon dioxide into the atmosphere annually, which is 20 percent of the world's total!",
    "According to Global Action Plan, air pollution causes heart disease and worsens asthma in both adults and children!",
    "Cars, trucks, buses and motorbikes – account for nearly three quarters of the greenhouse gas emissions that come from transport!",
    "In England, around 60% of 1-2 mile trips are made by car, which can easily be done by walking or biking!",
    "Taking a local bus emits a little over half the greenhouse gases of a single occupancy car journey and also help to remove congestion from the roads!",
    "A decade ago SUVs made up 17% of global yearly car sales, but now account for 39%!",
    "One recent report found ride-hailing services emits 69% more climate pollution on average than the journeys they displace!",
    "SPECIAL FUN FACT: While working on this project, Dan and Rumi drove absolutely nowhere, so we are cool!"
]

function getRandomFunFact() {
    return funFacts[Math.floor(Math.random() * funFacts.length)];
}