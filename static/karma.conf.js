'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: [ 'jasmine', 'fixture' ],

    files: [
      'test/vendor/tvp-3.1.2.min.js',
      'test/vendor/tvpa.min.js',

      'libs/**/!(utils.min).js',

      'test/**/*Spec.js',
      'test/**/*.html',
      'test/**/*.json'
    ],

    reporters: [ 'progress', 'coverage' ],

    preprocessors: {
      'libs/**/*.js': 'coverage',
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
          {type: 'html', dir: 'coverage', subdir: 'html'},
          {type: 'clover', dir: 'coverage', subdir: '.', file: 'clover.xml'}
      ]
    },

    jsonFixturesPreprocessor: {
      variableName: '__json__'
    }
  });
};