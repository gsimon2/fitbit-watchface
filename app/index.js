//Import Modules
import document from "document";
import clock from "clock";
import Weather from '../common/weather/device'
import { HeartRateSensor } from "heart-rate";
import * as messaging from "messaging"
import { today } from 'user-activity';
import * as util from "../common/utils";
import { preferences } from "user-settings";
import { battery } from "power";
import { charger } from "power";
import { user } from "user-profile";
import { units } from "user-settings";
import { display } from "display";
display.autoOff = true;


console.log("App Started");
//Handle <Text> Elements
let myDate = document.getElementById("myDate");
let myTime = document.getElementById("myTime");
let myHR = document.getElementById("myHR");;
let myPower = document.getElementById("myPower")
let myTemp = document.getElementById("myTemp");
let myDescription = document.getElementById("myDescription");
let myLocation = document.getElementById("myLocation")
let mySteps = document.getElementById("mySteps")
let myCalories = document.getElementById("myCalories")
let myActiveMinutes = document.getElementById("myActiveMinutes")

//Handle <"Image"> Elements
let myImage1 = document.getElementById("myImage1")
let myImage2 = document.getElementById("myImage2")
let heartRateIcon = document.getElementById("heartRateIcon")


// Debug 
let myDebug = document.getElementById("myDebug")
//myDebug.style.display = "inline";
//myDebug.text = 'test';

// Secret messages
let mySecretMsg1 = document.getElementById("mySecretMsg1")
let mySecretMsg2 = document.getElementById("mySecretMsg2")



//-------------------------------------------------------------------------
//                   Display Change
//-------------------------------------------------------------------------
display.onchange = function() {
  if (display.on) {
    var systemState = 1;
    update_state()
    refresh_myActivity()
    refresh_myHR()
    refresh_myPower()
  }
}
    
    
    
//-------------------------------------------------------------------------
//                   Clock
//-------------------------------------------------------------------------
clock.granularity = 'seconds';

let days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];l
let months = ["Jan", "Feb",  "Mar",  "Apr",  "May",  "Jun",  "Jul",  "Aug",  "Sep",  "Oct",  "Nov", "Dec"];

clock.ontick = function(evt) {
    let today = evt.date;
  let hours = today.getHours();
  let seconds = util.zeroPad(today.getSeconds());
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
    }
  else {
    // 24h format
    hours = util.zeroPad(hours);
    }
  let mins = util.zeroPad(today.getMinutes());
  myTime.text = `${hours}:${mins}`;
  
    myDate.text =  days[evt.date.getDay()] + " " + months[evt.date.getMonth()] + " " + evt.date.getDate();
}
    
//-------------------------------------------------------------------------
//                Heart Rate Monitor
//-------------------------------------------------------------------------
var hrm = new HeartRateSensor();

hrm.start();
function refresh_myHR() {
    myHR.text = "" + hrm.heartRate
    };

setInterval(refresh_myHR, 1000);


//-------------------------------------------------------------------------
//                Battery Refresh Monitor
//-------------------------------------------------------------------------
function refresh_myPower() {
myPower.text = (Math.floor(battery.chargeLevel) + "%") + (" " + (charger.connected ? "Charging..." : " ") + "");
};

setInterval(refresh_myPower, 1000);


//-------------------------------------------------------------------------
//                Weather
//-------------------------------------------------------------------------
let provider = 0
// Enter your own api keys below
const PROVIDERS = [
  { name : 'yahoo', key : '' },
  { name : 'owm', key : '' },
  { name : 'wunderground', key : '' },
  { name : 'darksky', key : '' },
  { name : 'weatherbit', key : '' }
]

// Create the weather object
let weather = new Weather()

let showWeather = function(data){
  if (data) {
    if (units.temperature == "F")
    myTemp.text =  data.temperatureF + " °F";
    
  else
    myTemp.text = data.temperatureC + " °C";
    
    myDescription.text = data.description
    myLocation.text = data.location
  }
}

// Display the weather data received from the companion
weather.onsuccess = showWeather

weather.onerror = (error) => {
  console.log("Weather error " + JSON.stringify(error))
  
  document.getElementById("location").text = JSON.stringify(error)
}

let fetchWeather = function(){
  // Set the provider : yahoo / owm / wunderground / darksky / weatherbit
  weather.setProvider(PROVIDERS[provider].name)
  // set your api key
  weather.setApiKey(PROVIDERS[provider].key)
  
  
  weather.fetch()
}

showWeather( weather.getData() )

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  fetchWeather()
}


//-------------------------------------------------------------------------
//                Refreshing activity
//-------------------------------------------------------------------------
function refresh_myActivity() {
  mySteps.text = today.adjusted.steps + " Steps"
  myCalories.text = today.adjusted.calories + " Cals"
  myActiveMinutes.text = today.adjusted.activeMinutes + " Active Mins"

}
setInterval(refresh_myActivity, 1000);



//-------------------------------------------------------------------------
//                Button + State Handling
//-------------------------------------------------------------------------
var systemState = 1; 
var numberSystemStates = 3;
var leftButton = document.getElementById("leftButton");
var rightButton = document.getElementById("rightButton");
var buttonSeq = [];
update_state();




leftButton.onactivate = function (evt) {
  systemState = (systemState - 1)
  
  if (systemState < 0) { 
    systemState = numberSystemStates - 1;
    }
  else { 
    systemState = systemState % numberSystemStates;
    }
  update_state();
  detect_seq('left');
}

rightButton.onactivate = function (evt) {
  systemState = (systemState + 1) % numberSystemStates;
  update_state();
  detect_seq('right');
}

// Show or hide element function
function showElement(element) {
    element.style.display = "inline";
}
function hideElement(element) {
    element.style.display = "none";
}

function hide_all_elements() {
  hideElement(myTime);
  hideElement(myDate);
  hideElement(myHR);
  hideElement(myImage1);
  hideElement(myImage2);
  hideElement(myPower);
  hideElement(mySteps);
  hideElement(myCalories);
  hideElement(myActiveMinutes);
  hideElement(myDescription);
  hideElement(myLocation)
  hideElement(myTemp)
  hideElement(mySecretMsg1);
  hideElement(mySecretMsg2);
  hideElement(heartRateIcon);
  
}

function update_state() {
  
  hide_all_elements()
  switch(systemState) {
    case 0:
      showElement(myImage1);
      break;
      
    case 1:
      showElement(myTime);
      showElement(myDate);
      showElement(myHR);
      showElement(myImage1);
      showElement(myPower);
      showElement(heartRateIcon);
      break;
      
    case 2:
      showElement(mySteps);
      showElement(myCalories);
      showElement(myActiveMinutes);
      showElement(myTemp);
      showElement(myDescription);
      showElement(myLocation);
      break;
      
    default:
      break;
  }//switch
}//function



//-------------------------------------------------------------------------
//               Detect if a sequence of buttons have been hit
//-------------------------------------------------------------------------
function detect_seq (button_press) {
  //console.log("Entered Function!");
  
  let secretSeq = ['left', 'right', 'left', 'left'];
  
  buttonSeq.push(button_press);
  let tempSeq = secretSeq.slice(0,buttonSeq.length)
  console.log(tempSeq);

  if (buttonSeq.toString() == tempSeq.toString()) {
    //console.log("On the right path");
    if (buttonSeq.toString() == secretSeq.toString()) {
       //console.log("Sequence Correct");
       systemState = 0;
       update_state();
       hide_all_elements()
       showElement(myImage2);
       mySecretMsg1.text = "Happy Birthday!";
       mySecretMsg2.text = "I love you! <3";
       showElement(mySecretMsg1);
       showElement(mySecretMsg2);
       buttonSeq = [];
     }
     if (buttonSeq.length >= secretSeq.length) {
       //console.log("Exceeded length");
       buttonSeq = [];
     }
  }
  else {
    //console.log("wrong seq");
    buttonSeq = [];
  }
}






