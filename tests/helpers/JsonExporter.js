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
    var orphans = {
        passed: 0,
        failed: 0,
        pending: 0,
        skipped: 0,
        duration: 0,
        specs: []
    };

    var summary = {
        appName: packageJson.name,
        appVersion: packageJson.version,
        specs: 0,
        failures: 0,
        passed: 0,
        pending: 0,
        skipped: 0,
        duration: 0,
        startDate: new Date().toISOString()
    };

    this.suiteStarted = function(suiteInfo) {
        suites[suiteInfo.id] = sweetMerge(suiteInfo, {passed: 0, failed: 0, pending: 0, skipped: 0, duration: 0, specs: []});
    }

    this.specDone = function(result) {
        parentSuite = null;
        if(result.parentSuiteId){
            parentSuite = suites[result.parentSuiteId]
            parentSuite.specs.push(result);
        }
        else{
            parentSuite = orphans;
            orphans.specs.push(result);
        }

        summary.specs++;
        summary.duration += result.duration;
        parentSuite.duration += result.duration;

        if(result.pendingReason === 'Temporarily disabled with xit'){
            summary.skipped++;
            parentSuite.skipped++;
        }
        else if(result.status === 'failed'){
            summary.failures++;
            parentSuite.failed++;
        }
        else if(result.status === 'pending'){
            summary.pending++;
            parentSuite.pending++;
        }
        else{
            summary.passed++;
            parentSuite.passed++;
        }
    }
    
    this.suiteDone = function(result) {
        sweetMerge(suites[result.id], result);
    }

    this.jasmineDone = function(suiteInfo) {
        fs.writeFileSync(outputFile, JSON.stringify({summary: summary, suites: suites, orphans: orphans}, null, 4));
    }
};

reporter = new JsonExporter("report.json");

jasmine.getEnv().addReporter(reporter);