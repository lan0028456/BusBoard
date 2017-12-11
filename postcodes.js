const rp = require('request-promise');
const log4js = require('log4js');
const logger = log4js.getLogger();

// Return a promise of Lat/Long
function postcode2LatLon(postcode) {
    let url = 'https://api.postcodes.io/postcodes/' + postcode;
    return rp(url)
        .then(body => new Lat_Lon(body))
        .catch(err => {
            logger.error('Request Failed with status ' + err.statusCode + '\nMessage: ' + err.message);
            throw new Error('Request Failed with status ' + err.statusCode + '\nDid you enter an invalid postcode?\nMessage: ' + err.message);
        })
}

class Lat_Lon {
    constructor(data) {
        let dataParse = JSON.parse(data);
        this.latitude = dataParse.result.latitude;
        logger.debug('latitude = ' + this.latitude);
        this.longitude = dataParse.result.longitude;
        logger.debug('longitude = ' + this.longitude);
    };
}

module.exports = {postcode2LatLon};