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
        let lat_Lon = new Lat_Lon(postcodeResponse);
        return getStations(lat_Lon);
    })
    .then(stationsList => {
        let stationIDs = new StationIDs(stationsList);
        return Promise.all([getNextBuses(stationIDs.id1),getNextBuses(stationIDs.id2)]);
    })
    .then(busesInfo => {
        getBusList(busesInfo[0]);
        getBusList(busesInfo[1]);
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

function getStations(latLon) {
    const latlonUrl = 'https://api.tfl.gov.uk/Stoppoint?lat=' + latLon.latitude + '&lon=' + latLon.longitude + '&stoptypes=NaptanPublicBusCoachTram';
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
    let dataParse = JSON.parse(data);
    let list = [];
    dataParse.forEach(bus =>{
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

//////////////////Classes/////////////////////////
}
class StationIDs {
    constructor(data) {
        let dataParse = JSON.parse(data);
        let dataStopPoints = dataParse.stopPoints;
        dataStopPoints.sort(function (a, b) {
            if (a.distance < b.distance) {
                return -1;
            } else if (a.distance > b.distance) {
                return 1;
            } else {
                return 0;
            }
        });
        this.id1 = dataStopPoints[0].id;
        this.id2 = dataStopPoints[1].id;
    }
}
class Lat_Lon {
    constructor(data) {
        let dataParse = JSON.parse(data);
        this.latitude = dataParse.result.latitude;
        this.longitude = dataParse.result.longitude;
        logger.debug('latitude = ' + this.latitude);
        logger.debug('longitude = ' + this.longitude);
    };
}

class LineInfo {
    constructor(lineName, destinationName, towards, expectedArrival) {
        this.lineName = lineName;
        this.destinationName = destinationName;
        this.towards = towards;
        this.expectedArrival = expectedArrival;
    };
}