const fs = require('fs');
const packageJson = require('../../package.json');
const { start } = require('repl');

function sweetMerge(dict1, dict2){
    for (var key in dict2){
        if (dict1.hasOwnProperty(key)){
            if (typeof dict1[key] === 'object' && typeof dict2[key] === 'object'){
                dict1[key] = sweetMerge(dict1[key], dict2[key]);
            } else {
                dict1[key] = dict2[key];
            }
        }
        else {
            dict1[key] = dict2[key];
        }
    }
    return dict1;
}

const JsonExporter = function(outputFile){

    var suites = {};
    suites['orphansSpecs'] = [];

    var summary = {
        appName: packageJson.name,
        appVersion: packageJson.version,
        specs: 0,
        failures: 0,
        pending: 0,
        duration: 0,
        startDate: new Date().toUTCString()
    };

    this.suiteStarted = function(suiteInfo) {
        suites[suiteInfo.id] = sweetMerge(suiteInfo, {specs: []});
    }

    this.specDone = function(result) {
        if(result.parentSuiteId){
            suites[result.parentSuiteId].specs.push(result);
        }
        else{
            suites['orphansSpecs'].push(result);
        }

        summary.specs++;
        summary.duration += result.duration;
        if(result.status === 'failed'){
            summary.failures++;
        }
        else if(result.status === 'pending'){
            summary.pending++;
        }
    }
    
    this.suiteDone = function(result) {
        sweetMerge(suites[result.id], result);
    }

    this.jasmineDone = function(suiteInfo) {
        fs.writeFileSync(outputFile, JSON.stringify({summary: summary, suites: suites}, null, 4));
    }
};

reporter = new JsonExporter("report.json");

jasmine.getEnv().addReporter(reporter);