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
            'dist/css/*.css': 'dist/css/*.css',
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
            'dist/css/styles.min.css': ['css/styles.css'],
            'dist/css/modal/styles.min.css': ['css/modal/styles.css']
          }
        },
        mobile: {
          files: {
            'dist/css/mobile/host.min.css': ['css/mobile/host.css'],
            'dist/css/mobile/modal/styles.min.css': ['css/mobile/modal/styles.css'],
          }
        }
      },
      uglify: {
        options: {
          beautify: false
        },
        modal: {
          files: {
            'dist/js/modal/scripts.min.js': ['js/libs/utils.js', 'js/libs/analytics.js','js/libs/player.js', 'js/modal/index.js']
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