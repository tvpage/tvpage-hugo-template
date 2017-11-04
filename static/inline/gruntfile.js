module.exports = function(grunt) {

    grunt.initConfig({
      watch: {
        sass:{
          files: ['scss/**/*.scss'],
          tasks: ['sass', 'autoprefixer', 'cssmin']
        },
        scripts:{
          files : ['js/**/*.js'],
          tasks : ['concat:dev']
        }
      },
      sass: {
        dist: {
          options:{
            style : 'expanded'
          },
          files: {
            'css/styles.css' : 'scss/styles.scss'
          }
        }
      },
      autoprefixer: {
        css: {
          files: {
            'css/styles.css' : 'css/styles.css'
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
            'dist/css/styles.min.css' : ['css/styles.css']
          }
        }
      },
      uglify: {
        options: {
          compress: {
            drop_console: true
          }
        },
        scripts: {
          files: {
            'dist/js/scripts.min.js': [
               'js/vendor/jquery.js'
              ,'js/vendor/slick-min.js'
              ,'js/vendor/jquery.ellipsis.js'
              ,'js/carousel.js'
              ,'js/libs/analytics.js'
              ,'js/libs/utils.js'
              ,'js/libs/player.js'
              , 'js/inline.js'
              , 'js/index.js']
          }
        }
      },
      concat: {
        options: {
          separator: ';',
        },
        dev: {
          src: [
             'js/vendor/jquery.js'
            ,'js/vendor/slick-min.js'
            ,'js/vendor/jquery.ellipsis.js'
            ,'js/carousel.js'
            ,'js/libs/analytics.js'
            ,'js/libs/utils.js'
            ,'js/libs/player.js'
            , 'js/inline.js'
            , 'js/index.js'],
          dest: 'js/scripts.js'
        }
      }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    
    grunt.registerTask('default', ['concat:dev', 'sass', 'autoprefixer', 'cssmin', 'concat:dev', 'watch']);
    grunt.registerTask('release', ['uglify', 'sass', 'autoprefixer', 'cssmin']);
};