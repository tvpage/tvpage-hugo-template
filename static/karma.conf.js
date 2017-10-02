'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: [ 'jasmine', 'fixture' ],

    files: [
      'vendor/tvp-3.1.2.min.js',
      'vendor/tvpa.min.js',

      'sdk/libs/**/*.js',

      'test/**/*Spec.js',
      'test/**/*.html',
      'test/**/*.json'
    ],

    reporters: [ 'coverage' ],

    preprocessors: {
      'sdk/libs/**/*.js': 'coverage',      
      'test/**/*.html' : 'html2js',
      'test/**/*.json' : 'json_fixtures'
    },

    browsers: [ 'PhantomJS' ],

    logLevel: 'LOG_DEBUG',

    colors: true,

    singleRun: true,

    autoWatch: false,

    coverageReporter: {
      reporters: [
          {type: 'text-summary'},
          {type: 'clover', dir: 'coverage', subdir: '.', file: 'clover.xml'}
      ]
    },

    jsonFixturesPreprocessor: {
      variableName: '__json__'
    }
  });
};