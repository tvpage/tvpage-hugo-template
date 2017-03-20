module.exports = function(grunt) {

    grunt.initConfig({
      watch: {
        // css: {
        //   files: ['css/**/*.css'],
        //   tasks: ['autoprefixer']
        // },
        sass:{
          files: ['scss/**/*.scss'],
          tasks: ['sass', 'autoprefixer', 'cssmin']
        }
      },
      sass: {
        dist: {
          options:{
            style : 'expanded'
          },
          files: {
            'css/styles.css' : 'scss/styles.scss',
            'css/inline.css' : 'scss/styles.scss',
            'css/host.css' : 'scss/host.scss',
            'css/mobile/host.css' : 'scss/mobile/host.scss'
          }
        }
      },
      autoprefixer: {
        css: {
          files: {
            'css/host.css': 'css/host.css',
            'css/mobile/host.css': 'css/mobile/host.css',
            // 'css/styles.css': 'css/styles.css',
            // 'css/modal/styles.css': 'css/modal/styles.css',
            // 'css/mobile/modal/styles.css': 'css/mobile/modal/styles.css'
            'css/inline.css' : 'css/inline.css',
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
            'dist/css/inline.min.css' : ['css/inline.css'],
            'dist/css/styles.min.css' : ['css/styles.css'],
            'dist/css/host.min.css' : ['css/host.css'],
          }
        },
        mobile: {
          files: {
            // 'dist/css/mobile/modal/styles.min.css': ['css/vendor/slick.css', 'css/mobile/modal/styles.css'],
            'dist/css/mobile/host.min.css': ['css/mobile/host.css']
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
              ,'js/vendor/simple-scrollbar.min.js'
              ,'js/carousel.js'
              ,'js/libs/analytics.js'
              ,'js/libs/utils.js'
              ,'js/libs/player.js'
              , 'js/inline.js'
              , 'js/index.js']
          }
        },
        // modal: {
        //     files: {
        //         'dist/js/modal/scripts.min.js': ['js/vendor/jquery.js', 'js/libs/utils.js', 'js/libs/analytics.js','js/libs/player.js','js/vendor/simple-scrollbar.min.js', 'js/modal/index.js'],
        //         'dist/js/mobile/modal/scripts.min.js': ['js/vendor/jquery.js', 'js/libs/utils.js', 'js/libs/analytics.js','js/libs/player.js', 'js/mobile/modal/index.js']
        //     }
        // }
      },
      concat: {
        options: {
          separator: ';',
        },
        dist: {
          src: ['src/intro.js', 'src/project.js', 'src/outro.js'],
          dest: 'dist/built.js',
        },
      }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    
    grunt.registerTask('default', ['sass', 'autoprefixer', 'cssmin', 'watch']);
    grunt.registerTask('release', ['uglify', 'sass', 'autoprefixer', 'cssmin']);
};