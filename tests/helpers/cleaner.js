const fs = require('fs');

const Cleaner = {
    jasmineDone: function() {
        console.log('Cleaning up...');
        // Clean up your mess here

        fs.rmSync('./suite-info.json')
        fs.rmSync('./spec-result.json')
        fs.rmSync('./done.json') 
    }
}

jasmine.getEnv().addReporter(Cleaner);