const fs = require('fs');

const dataPromise = new Promise((resolve, reject) => {
    fs.readFile('Part1.js', (err, data) => {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    })
});

dataPromise
    .then(data => data.length)
    .then(len => console.log('length ' + len))
    .catch(err => console.log('error', err));
