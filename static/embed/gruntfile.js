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
            'dist/css/*.css': 'dist/css/*.css'
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
            'dist/css/styles.min.css': ['css/styles.css']
          }
        }
      },
      uglify: {
        options: {
          //beautify: true
        },
        scripts: {
          files: {
            'dist/js/scripts.min.js': [
              '../libs/analytics.js',
              '../libs/player.js'
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