const rp = require('request-promise');
const log4js = require('log4js');
const logger = log4js.getLogger();

// Return a promise of next buses
function getNextBuses(stationID,appID,appKey) {
    let url = 'https://api.tfl.gov.uk/StopPoint/' + stationID + '/Arrivals?app_id=' + appID + '&app_key=' + appKey;
    return rp(url)
        .then(logger.debug('Next Buses Info Loaded'))
        .catch(err => {
            logger.error('Request Failed with status ' + err.statusCode + '\nMessage: ' + err.message);
            throw new Error('Request Failed with status ' + err.statusCode + '\n Message: ' + err.message);
        })
}

module.exports = {getNextBuses};