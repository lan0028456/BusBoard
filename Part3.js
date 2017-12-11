const readline = require('readline-sync');
const log4js = require('log4js');
const postcodes = require('./postcodes');
const latlons = require('./latlons');
const nextBuses = require('./nextBuses');
const busList = require('./busList');

log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' },
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});
const logger = log4js.getLogger();

//////////////////Input/////////////////////////

logger.debug('Let\'s get start!');

console.log('Please enter your postcode: ');
//const postcode = readline.prompt();
const postcode = 'NW5 1TL';
logger.debug('Input postcode = ' + postcode);
const appID = '889435f2';
const appKey = '912066946f556aab9753303523b446d6';

//////////////////Main program/////////////////////////

postcodes.postcode2LatLon(postcode)
    .then(latLons => {
        return latlons.latLon2IDs(latLons, appID, appKey);
    })
    .then(stationIDs => {
        return Promise.all([nextBuses.getNextBuses(stationIDs.id1,appID,appKey),nextBuses.getNextBuses(stationIDs.id2,appID,appKey)]);
    })
    .then(busesInfo => {
        busList.getBusList(busesInfo[0]);
        busList.getBusList(busesInfo[1]);
    })
    .catch(console.log);
