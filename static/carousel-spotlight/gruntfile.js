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
            
            'css/modal/styles.css': 'css/modal/styles.css',
            'css/mobile/modal/styles.css': 'css/mobile/modal/styles.css'
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
              '../bootstrap/dist/css/bootstrap.css',
              '../slick/slick.css'
            ],
            'dist/css/modal/styles.min.css': [
              '../bootstrap/dist/css/bootstrap.css',
              '../slick/slick.css',
              'css/modal/styles.css'
            ]
          }
        },
        mobile: {
          files: {
            'dist/css/mobile/modal/styles.min.css': [
              '../bootstrap/dist/css/bootstrap.css',
              '../slick/slick.css'
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
              '../libs/carousel.js',
              'js/index.js'
            ]
          }
        },
        modal: {
          files: {
            'dist/js/modal/scripts.min.js': [
              'js/vendor/jquery.js',
              '../libs/utils.js',
              '../libs/analytics.js',
              '../libs/player.js',
              '../libs/carousel.js',
              'js/modal/index.js'
            ],
            'dist/js/mobile/modal/scripts.min.js': [
              'js/vendor/jquery.js',
              '../libs/utils.js',
              '../libs/analytics.js',
              '../libs/player.js',
              'js/mobile/modal/index.js'
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
