const request = require('request');
const readline = require('readline-sync');
const log4js = require('log4js');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' },
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});
const logger = log4js.getLogger();
logger.debug('Let\'s get start!');

console.log('Please enter your postcode: ');
//const postcode = readline.prompt();api.postcodes.io/postcodes/
const postcode = 'NW5 1TL';
logger.debug('Input postcode = ' + postcode);
const appID = '889435f2';
const appKey = '912066946f556aab9753303523b446d6';

//////////////////Main program/////////////////////////

lookupPostcode()
    .then(postcodeResponse => {
        let data = JSON.parse(postcodeResponse);
        const latitude=data.result.latitude;
        logger.debug('latitude = ' + latitude);
        const longitude=data.result.longitude;
        logger.debug('longitude = ' + longitude);
        return getStations(latitude,longitude);
    })
    .then(stationslist => {
        let stationsinfo = JSON.parse(stationslist);
        let ids = [stationsinfo.stopPoints[0].id, stationsinfo.stopPoints[1].id];
        return Promise.all([getNextBuses(ids[0]),getNextBuses(ids[1])]);
    })
    .then(busesinfo => {
        let busesinfoParse1 = JSON.parse(busesinfo[0]);
        let busesinfoParse2 = JSON.parse(busesinfo[1]);
        let busList1 = getBusList(busesinfoParse1);
        displayResult(busList1);
        let busList2 = getBusList(busesinfoParse2);
        displayResult(busList2);
    })
    .catch(err => console.log(err));

//////////////////Function (Promises)/////////////////////////

function lookupPostcode() {
    const postcodeUrl = 'https://api.postcodes.io/postcodes/' + postcode + '?app_id=' + appID + '&app_key=' + appKey;
    return new Promise((resolve, reject) => {
        request(postcodeUrl, (error, response, body) => {
            if (error) {
                reject(error);
                logger.debug('error (loading post code):', error);
            } else if (response.statusCode !== 200) {
                reject('Request Failed with status ' + response.statusCode);
            } else {
                resolve(body);
            }
        });
    });
}

function getStations(latitude,longitude) {
    const latlonUrl = 'https://api.tfl.gov.uk/Stoppoint?lat=' + latitude + '&lon=' + longitude + '&stoptypes=NaptanPublicBusCoachTram';
    return new Promise((resolve, reject) => {
        request(latlonUrl, function (error, response, body) {
            if (error) {
                reject(error);
                logger.debug('error (loading stations):', error);
            } else if (response.statusCode !== 200) {
                reject('Request Failed with status ' + response.statusCode);
            } else {
                resolve(body);
            }
        });
    });
}

function getNextBuses(stationsID) {
    const stationUrl = 'https://api.tfl.gov.uk/StopPoint/' + stationsID + '/Arrivals?app_id=' + appID + '&app_key=' + appKey;
    return new Promise((resolve, reject) => {
        request(stationUrl, function (error, response, body) {
            if (error) {
                reject(error);
                logger.debug('error (loading buses):', error);
            } else if (response.statusCode !== 200) {
                reject('Request Failed with status ' + response.statusCode);
            } else {
                resolve(body);
            }
        });
    });
}

//////////////////Functions/////////////////////////

function getBusList(data) {
    let list = [];
    data.forEach(bus =>{
        let businfo = new LineInfo(bus.lineName, bus.destinationName, bus.towards, bus.expectedArrival);
        list.push(businfo);
    });
    list.sort(function (a, b) {
        if (a.expectedArrival < b.expectedArrival) {
            return -1;
        } else if (a.expectedArrival > b.expectedArrival) {
            return 1;
        } else {
            return 0;
        }
    });
    return list;
}

function displayResult(list) {
    console.log('The next 5 buses arrive at this station: ');
    console.log('Bus    Expected Arrival    Destination');
    for (let i = 0; i < 5; i++) {
        if (list[i].lineName.length===2) {
            console.log(list[i].lineName + '        ' +
                list[i].expectedArrival.slice(11,19) + '         ' +
                list[i].destinationName);
        } else {
            console.log(list[i].lineName + '       ' +
                list[i].expectedArrival.slice(11,19) + '         ' +
                list[i].destinationName);
        }
    }
}

class LineInfo {
    constructor(lineName, destinationName, towards, expectedArrival) {
        this.lineName = lineName;
        this.destinationName = destinationName;
        this.towards = towards;
        this.expectedArrival = expectedArrival;
    };
}