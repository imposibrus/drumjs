exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    '*.js'
  ],  

  capabilities: {
    'browserName': 'firefox'
  },
/*  multiCapabilities: [{
    'browserName': 'firefox'
  }, {
    'browserName': 'chrome'
  }]*/

  baseUrl: 'http://10.128.81.149:8080/examples/simple.html',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
