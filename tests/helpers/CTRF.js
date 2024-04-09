const CtrfReporter = require('jasmine-ctrf-json-reporter')

const packageJson = require('../../package.json')

jasmine.getEnv().addReporter(
  new CtrfReporter({
    outputDir: 'tests/reports',
    appName: packageJson.name,
    appVersion: packageJson.version,
  })
)