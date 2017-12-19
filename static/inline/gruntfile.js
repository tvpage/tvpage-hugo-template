module.exports = function (grunt) {
  grunt.initConfig({
    autoprefixer: {
      css: {
        files: {
        }
      }
    },
    cssmin: {
      options: {
        mergeIntoShorthands: false,
        roundingPrecision: -1
      },
      desktop: {
        files: {
          'dist/css/styles.min.css': [
            '../slick/slick.css',
            '../slick/custom.css'
          ]
        }
      },
      mobile: {
        files: {
          'dist/css/styles.min.css': [
            '../slick/slick.css',
            '../slick/mobile/custom.css'
          ]
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
          'dist/js/scripts.min.js': [
            'js/vendor/jquery.js',
            '../libs/analytics.js',
            '../libs/player.js',
            '../libs/carousel.js'
          ],
          'dist/js/index.min.js': [
            'js/index.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-autoprefixer');

  grunt.registerTask('default', ['uglify', 'autoprefixer', 'cssmin']);
};