const log4js = require('log4js');
const logger = log4js.getLogger();

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
    logger.debug('Next Buses Display List Loaded')
}

class LineInfo {
    constructor(lineName, destinationName, towards, expectedArrival) {
        this.lineName = lineName;
        this.destinationName = destinationName;
        this.towards = towards;
        this.expectedArrival = expectedArrival;
    };
}

module.exports = {getBusList};