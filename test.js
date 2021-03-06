const request = require('request');
const rp = require('request-promise');

const postcode = 'NW5 1TL';

postcode2LatLon(postcode)
    .then(console.log)
    .catch(err => {
        console.log(err);
    });
// Return a promise of Lat/Long
function postcode2LatLon(postcode) {
    let url = 'https://api.postcodes.io/postcodes/' + postcode;
    return rp(url)
        .then(body => new Lat_Lon(body))
        .catch(err => {
            throw new Error('Request Failed with status ' + err.statusCode + '\nDid you enter an invalid postcode?');
        })
}

class Lat_Lon {
    constructor(data) {
        let dataParse = JSON.parse(data);
        this.latitude = dataParse.result.latitude;
        this.longitude = dataParse.result.longitude;
    };
}
