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

get2Stationinfo(postcode);


function getLatLon(postcode) {
    request('https://api.postcodes.io/postcodes/' + postcode +
        '?app_id=' + appID +
        '&app_key=' + appKey, function (error, response, body) {
        logger.debug('error (loading post code):', error);
        logger.debug('statusCode (loading post code):', response && response.statusCode);
        let data = JSON.parse(body);
        const latitude=data.result.latitude;
        logger.debug('latitude = ' + latitude);
        const longitude=data.result.longitude;
        logger.debug('longitude = ' + longitude);
        console.log([latitude,longitude]);
        return [latitude,longitude];
    });
}

function getStations(postcode) {
    let latlon = getLatLon(postcode);
    console.log(latlon);
    request('https://api.tfl.gov.uk/Stoppoint?lat=' + latlon[0] +
        '&lon=' + latlon[1] +
        '&stoptypes=NaptanPublicBusCoachTram', function (error, response, body) {
        logger.debug('error (loading stations):', error);
        logger.debug('statusCode (loading stations):', response && response.statusCode);
        return JSON.parse(body);
    });
}

function get2Stationinfo(postcode) {
    let stationsinfo = getStations(postcode);
    getNextBuses(stationsinfo.stopPoints[0].id);
    getNextBuses(stationsinfo.stopPoints[1].id);
}

function getNextBuses(stationID) {
    request('https://api.tfl.gov.uk/StopPoint/' + stationID +
        '/Arrivals?app_id=' + appID +
        '&app_key=' + appKey, function (error, response, body) {
        logger.debug('error (loading bus info):', error);
        logger.debug('statusCode (loading bus info):', response && response.statusCode);
        let data = JSON.parse(body);
        let list = getBusList(data);
        displayResult(list)
    });
}

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