var timeElement;
var dateElement;
const millisPerDay = 86400000;
const log = false;
const daysPerWeek = 6;
const weeksPerSeason = 15;
const hoursPerDay = 20;
const minutesPerHour = 100;
const secondsPerMinute = 100;
const millisPerSecond = 432;

start();

function start() {
    timeElement = document.getElementById('clock');
    dateElement = document.getElementById('date');
    let dateTime = currentOhareanTime();
    timeElement.innerText = convertTimeToString(dateTime);
    dateElement.innerText = convertDateToString(dateTime);
    setInterval(function(){
        updateAll();
    }, 1);
}

function getCurrentTime(){
    return new Date();
}

function updateAll(){
    let dateTime = currentOhareanTime();
    timeElement.innerText = convertTimeToString(dateTime);
    dateElement.innerText = convertDateToString(dateTime);
}

function currentConventialMilliseconds() {
    let hour = getCurrentTime().getHours();
    let minute = getCurrentTime().getMinutes();
    let second = getCurrentTime().getSeconds();
    let millis = getCurrentTime().getMilliseconds();
    let totalMillis = millis + (second * 1000) + (minute * 60 * 1000) + (hour * 60 * 60 * 1000);
    return totalMillis;
}

function currentOhareanTime(){
    let currentMillis = currentConventialMilliseconds();
    let currentHour= (((currentMillis / millisPerSecond)/secondsPerMinute)/minutesPerHour);
    let currentMinute= (currentHour-Math.trunc(currentHour))*minutesPerHour;
    let currentSecond= (currentMinute-Math.trunc(currentMinute))*secondsPerMinute;

    let timeObject = {
        time: {
            currentHour: Math.trunc(currentHour),
            currentMinute: Math.trunc(currentMinute),
            currentSecond: Math.trunc(currentSecond)
        },
        date: calculateOHareanDate()
    }

    return timeObject;
}

function convertTimeToString(timeObject){
    let hour = formatNumber(timeObject.time.currentHour);
    let minute = formatNumber(timeObject.time.currentMinute);
    let second = formatNumber(timeObject.time.currentSecond);
    let timeString = hour+'.'+minute+'.'+second;
    return timeString
}

function convertDateToString(timeObject){
    let season = timeObject.date.season.description;
    let year = timeObject.date.year;
    let week = timeObject.date.week;
    let day = timeObject.date.day;
    let dateString = year+' HE '+season+' '+week+':'+day;
    return dateString;
}

function formatNumber(num) {
    let numString = String(num);
    if(numString.length === 1){
        return '0'+numString;
    }
    return numString;
}

function getCurrentDayOfYear() {
    let date = getCurrentTime();
    let days = 0;
    for(let i = date.getMonth() - 1; i >= 0; i--){
        days += daysInMonth()[i];
    }
    days += date.getDate();
    if(log){
        console.log('current day',days);
    }
    return days;
}

function isCommonYear(){
    let date = getCurrentTime();
    let value = true;
    if( (date.getFullYear()/4) === 0){
        value = false;
    }
    if(log){
        console.log('isCommonYear: ',value);
    }
    return value;
}

function daysInMonth() {
    let list= [31,getFebDays(),31,30,31,30,31,31,30,31,30,31];
    return list;
}

function getFebDays(){
    if(isCommonYear){
        return 28;
    } else {
        return 29;
    }
}

function getEquinoxOffsetDays(){
    let value = daysInMonth()[0]+daysInMonth()[1]+19;
    if(log){
        console.log('Offset: ',value);
    }
    return value; 
}

function getEquinoxOffsetMillis(){
    let value = (daysInMonth()[0]+daysInMonth()[1]+19)*millisPerDay;
    if(log){
        console.log('Offset: ',value);
    }
    return value; 
}

function getDaysFromEquinox(){
    let value = getCurrentDayOfYear() - getEquinoxOffsetDays();
    return value;
}

function getMilliOfYear() {
    let value = getCurrentDayOfYear()*millisPerDay + currentConventialMilliseconds();
    if(log){
        console.log('Current milli of year: ',value);
    }
    return value;
}

function getMillisFromEquinox(){
    let value = getMilliOfYear() - getEquinoxOffsetMillis();
    if(log){
        console.log('Current milli of year: ',value);
    }
    return value;
}

function calculateOHareanDate(){
    let millis = getMillisFromEquinox();
    let days = millis/millisPerDay;
    let seasonOfYear = 0;
    for(let i = 0; i < Math.trunc(days); i++){
        if(i % (daysPerWeek*weeksPerSeason) === 0 && i!==0){
            seasonOfYear++;
        }
    }
    let weekOfSeason = 0;
    let dayOfSeason = Math.trunc(days - (daysPerWeek*weeksPerSeason)*seasonOfYear);
    for(let i = 0; i < dayOfSeason; i++){
        if(i % daysPerWeek === 0 && i !== 0){
            weekOfSeason++;
        }
    }
    let dayOfWeek = dayOfSeason - (weekOfSeason*daysPerWeek);
    let year = getCurrentTime().getFullYear() + 10000;
    let date = {
        year: year,
        season: {
            id: seasonOfYear,
            description: getSeason(seasonOfYear)
        },
        week: weekOfSeason,
        day: dayOfWeek
    }
    return date;
}

function getSeason(x){
    let seasonList = ['Ineo','Cresco','Vigeo','Cado','Abeo']
    return seasonList[x];
}