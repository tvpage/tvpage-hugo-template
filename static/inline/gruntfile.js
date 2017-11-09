module.exports = function(grunt) {
    grunt.initConfig({
      watch: {
        css: {
          files: ['css/**/*.css'],
          tasks: ['autoprefixer']
        }
      },
      autoprefixer: {
        css: {
          files: {
            'css/styles.css': 'css/styles.css'
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
                '../bootstrap-4.0.0/css/bootstrap.css',
                'css/vendor/slick.css',
                'css/styles.css'
              ],
              'dist/css/host.min.css': [
                'css/host.css'
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
              'js/vendor/slick-min.js',
              '../libs/utils.js',
              '../libs/analytics.js',
              '../libs/player.js',
              '../libs/carousel.js',
              'js/index.js'
            ]
          }
        }
      }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['uglify', 'autoprefixer', 'cssmin']);

};