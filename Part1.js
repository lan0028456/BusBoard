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

const stationID = readline.prompt();
//const stationID = '490008660N';
logger.debug('Input station ID = ' + stationID);
const appID = '889435f2';
const appKey = '912066946f556aab9753303523b446d6';

request('https://api.tfl.gov.uk/StopPoint/' + stationID +
    '/Arrivals?app_id=' + appID +
    '&app_key=' + appKey, function (error, response, body) {
    logger.debug('error:', error);
    logger.debug('statusCode:', response && response.statusCode);
    let data = JSON.parse(body);
    let list = getBusList(data);
    displayResult(list)
});




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