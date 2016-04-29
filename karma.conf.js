module.exports = function(config) {
    config.set({

        basePath: './',

        files: [
            './contrib/jquery-1.9.1.js',
            './contrib/hammerjs/hammer.min.js',
            './lib/drum.js',
            './unit-tests/*.js'            
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome', 'Firefox'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
