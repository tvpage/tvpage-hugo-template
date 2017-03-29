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
            'css/styles.css': 'css/styles.css',
            'css/host.css': 'css/host.css'
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
            'dist/css/styles.min.css': ['css/styles.css'],
            'dist/css/host.min.css': ['css/host.css']
          }
        },
        mobile: {
          files: {
            'dist/css/mobile/host.min.css': ['css/mobile/host.css']
          }
        }
      },
      uglify: {
        options: {
          //beautify: true
        },
        scripts: {
          files: {
            'dist/js/scripts.min.js': ['js/libs/utils.js', 'js/libs/analytics.js','js/libs/player.js','js/vendor/simple-scrollbar.min.js', 'js/menu.js', 'js/index.js']
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