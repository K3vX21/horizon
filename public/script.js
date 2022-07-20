// weather at location
const searchElement = document.querySelector('[data-city-search]')
const searchBox = new google.maps.places.SearchBox(searchElement)
searchBox.addListener('places_changed', () => {
    const place = searchBox.getPlaces()[0]
    if (place == null) return
    const latitude = place.geometry.location.lat()
    const longitude = place.geometry.location.lng()
    fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            latitude: latitude,
            longitude: longitude
        })
    }).then(res => res.json()).then(data => {
        var todayDate = new Date()
        var todaySunsetDate = new Date(data.locations[latitude + ", " + longitude].currentConditions.sunset)
        var nextSunsetDate = todaySunsetDate

        // get next sunset
        if(todayDate.getTime() > todaySunsetDate.getTime()){
            // console.log(todayDate.toLocaleTimeString() + "is after " + todaySunsetDate.toLocaleTimeString())
            var nextDayHours = 24 - todayDate.getHours()
            var nextSunsetDate = new Date(data.locations[latitude + ", " + longitude].values[nextDayHours].sunset)
            // console.log(`the next sunset is tomorrow at ${nextSunsetDate.toLocaleTimeString()}`)
        }

        // round off sunset time
        var roundedSunsetDate = nextSunsetDate
        if(nextSunsetDate.getMinutes() < 30){
            roundedSunsetDate.setMinutes(0, 0, 0)
        } else {
            roundedSunsetDate.setHours(nextSunsetDate.getHours() + 1)
            roundedSunsetDate.setMinutes(0, 0, 0)
        }

        // get sunset measurements
        var nextSunsetHours = roundedSunsetDate.getHours() - todayDate.getHours()
        // console.log(`${nextSunsetHours} hours until sunset.`)
        // what if nextSunsetHours == 0? get currentConditions or values[0]? or are they the same?
        const sunsetHumidity = data.locations[latitude + ", " + longitude].values[nextSunsetHours].humidity / 100
        const sunsetCloudCover = data.locations[latitude + ", " + longitude].values[nextSunsetHours].cloudcover / 100
        // const sunsetPop = data.locations[latitude + ", " + longitude].values[nextSunsetHours].pop / 100
        // const sunsetPrecip = data.locations[latitude + ", " + longitude].values[nextSunsetHours - 1].precip / 100 //nextSunsetHours - 1 might not exist

        // console.log(sunsetHumidity)
        // console.log(sunsetCloudCover)
        // console.log(sunsetPop)

        // create model 
        var pSunset = 0;
        pSunset += 1 - sunsetHumidity
        pSunset += Math.exp(-16*((sunsetCloudCover-0.5)**2))
        // pSunset += 1 - sunsetPop
        // pSunset += sunsetPrecip/4.5
        pSunset /= 2
        pSunset = (pSunset * 100).toFixed(2)

        // console.log(`The probability of a sunset is ${pSunset/2 * 100}%`)
        
        setWeatherData(data.locations[latitude + ", " + longitude].values[nextSunsetHours], place.formatted_address, pSunset)
    })
})

const locationElement = document.querySelector('[data-location]')
const probElement = document.querySelector('[data-prob]')
const cloudcoverElement = document.querySelector('[data-cloudcover]')
const timeElement = document.querySelector('[data-datetime]')
const temperatureElement = document.querySelector('[data-temperature]')


function setWeatherData(data, location, sunsetProb){
    locationElement.textContent = location
    probElement.textContent = `The probability of a sunset is ${sunsetProb}%`
    cloudcoverElement.textContent = `${data.cloudcover}%`
    timeElement.textContent = (new Date(data.sunset)).toLocaleTimeString()
    temperatureElement.textContent = data.temp + "℉"

}

// image
const loadElement = document.querySelector('#btnLoad')
loadElement.addEventListener('click', analyzeImage)

function analyzeImage() {
    const file = document.querySelector('#imgFile').files[0]
    console.log(file)
    const reader = new FileReader();
    reader.readAsDataURL(file)
    console.log("1")
    reader.onloadedend = () => {
        console.log("2")
        //     HTMLImageElement
        // These are images created using the Image() constructor, as well as any <img> element.
        const img = new Image();
        img.height = 1000
        img.width = 1000
        img.src = file.result
    }
    const ctx = document.querySelector('canvas').getContext('2d')
    // file.onload = ctx.drawImage(img, 0, 0)\
}




// Get a reference to an HTMLImageElement object or to another
// canvas element as a source. It is also possible to use images
// by providing a URL.

// Draw the image on the canvas using the drawImage() function.



let imgInput = document.getElementById('imageInput');
imgInput.addEventListener('change', function (e) {
    if (e.target.files) {
        let imageFile = e.target.files[0]; //here we get the image file
        var reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = function (e) {
            var myImage = new Image(); // Creates image object
            myImage.src = e.target.result; // Assigns converted image to image object
            myImage.onload = function (ev) {
                var myCanvas = document.getElementById("myCanvas"); // Creates a canvas object
                var myContext = myCanvas.getContext("2d"); // Creates a contect object
                myCanvas.width = myImage.width; // Assigns image's width to canvas
                myCanvas.height = myImage.height; // Assigns image's height to canvas
                myContext.drawImage(myImage, 0, 0); // Draws the image on canvas
                let imgData = myCanvas.toDataURL("image/jpeg", 0.75); // Assigns image base64 string in jpeg format to a variable
            }
        }
    }
})