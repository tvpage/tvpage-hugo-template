module.exports = function (grunt) {

  var fs = require('fs');
  var jsStringEscape = require('js-string-escape');

  grunt.initConfig({
    sass: {
      options: {
        sourceMap: true,
        outputStyle: 'compressed'
      },
      dist: {
        files: {
          'bootstrap/dist/css/bootstrap.css': 'bootstrap/scss/main.scss'
        }
      }
    },
    autoprefixer: {
      css: {
        files: {
          'slick/slick.css': 'slick/slick.css',
          'slick/mobile/custom.css': 'slick/mobile/custom.css',
          'slick/custom.css': 'slick/custom.css'
        }
      }
    },
    uglify: {
      options: {
        compress: {
          drop_console: false
        }
      },
      scripts: {
        files: {
          'libs/utils.min.js': [
            'libs/utils.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('escape', 'escapes content.', function () {
    var done = this.async();

    fs.readFile('bootstrap/dist/css/bootstrap.css', 'utf8', function (err, data) {
      fs.writeFile('bootstrap/dist/css/bootstrap-escaped.txt', '"' + jsStringEscape(data) + '"', function (err) {
        if (err) {
          return console.log(err);
        }

        console.log("bootstrap.css file was escaped");

        done();
      });
    })

  });

  grunt.registerTask('default', ['sass', 'autoprefixer', 'escape', 'uglify']);

};
