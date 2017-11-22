module.exports = function(grunt) {

    grunt.initConfig({
      watch: {
        css: {
          files: ['css/**/*.css'],
          tasks: ['cssmin', 'autoprefixer']
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
              'css/styles.css',
              'css/vendor/perfect-scrollbar.min.css'
            ]
          }
        }
      },
      uglify: {
        options: {
        },
        scripts: {
          files: {
            'dist/js/scripts.min.js': [
              '../libs/utils.js',
              '../libs/analytics.js',
              '../libs/player.js',
              'js/vendor/perfect-scrollbar.min.js',
              'js/menu.js',
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
    
    grunt.registerTask('default', ['uglify', 'cssmin', 'autoprefixer']);

};