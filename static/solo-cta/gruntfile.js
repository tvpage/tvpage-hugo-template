module.exports = function(grunt) {
  
    grunt.initConfig({
      autoprefixer: {
        css: {
          files: {
            'css/modal/styles.css': 'css/modal/styles.css',
            'css/mobile/modal/styles.css': 'css/mobile/modal/styles.css',
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
              'css/styles.css'
            ],
            'dist/css/modal/styles.min.css': [
              '../bootstrap/dist/css/bootstrap.css',
              'css/vendor/perfect-scrollbar.min.css',
              'css/modal/styles.css'
            ]
          }
        },
        
        //the solo-cta piece works well with the desktop CSS
        mobile: {
          files: {
            'dist/css/mobile/modal/styles.min.css': [
              '../bootstrap/dist/css/bootstrap.css',
              '../slick/slick.css',
              '../slick/mobile/custom.css',
              'css/mobile/modal/styles.css'
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
              '../libs/analytics.js'
            ],
            'dist/js/index.min.js': [
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
              '../libs/modal.js',
              '../libs/rail.js',
              'js/vendor/perfect-scrollbar.min.js',
              'js/modal/index.js'
            ],
            'dist/js/mobile/modal/scripts.min.js': [
              'js/vendor/jquery.js',
              '../libs/utils.js',
              '../libs/analytics.js',
              '../libs/player.js',
              '../libs/carousel.js',
              '../libs/modal.js',
              'js/mobile/modal/index.js'
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