const rp = require('request-promise');
const log4js = require('log4js');
const logger = log4js.getLogger();

// Return a promise of Bus Station IDs
function latLon2IDs(latLon,appID,appKey) {
    let url = 'https://api.tfl.gov.uk/Stoppoint?lat=' + latLon.latitude + '&lon=' + latLon.longitude + '&stoptypes=NaptanPublicBusCoachTram&app_id=' + appID + '&app_key=' + appKey;
    return rp(url)
        .then(body => new StationIDs(body))
        .catch(err => {
            logger.error('Request Failed with status ' + err.statusCode + '\nMessage: ' + err.message);
            throw new Error('Request Failed with status ' + err.statusCode + '\n Message: ' + err.message);
        })
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
        logger.debug('id1 = ' + dataStopPoints[0].id);
        this.id2 = dataStopPoints[1].id;
        logger.debug('id2 = ' + dataStopPoints[1].id);
    }
}

module.exports = {latLon2IDs};