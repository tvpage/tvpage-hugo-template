module.exports = function(grunt) {
    grunt.initConfig({
        sass: {
          dev: {
            options: {
              sourceMap: true,
              outputStyle: 'expanded',
              includePaths: ['node_modules/bootstrap-sass/assets/stylesheets']
            },
            files: {
              'css/styles.css': 'sass/styles.scss'
            }
          },
          dist: {
            options: {
              sourceMap: true,
              outputStyle: 'compressed',
              includePaths: ['node_modules/bootstrap-sass/assets/stylesheets']
            },
            files: {
              'css/styles.css': 'sass/styles.scss'
            }
          }
        },
        watch: {
            css: {
                files: 'sass/*.scss',
                tasks: ['sass', 'postcss:dist']
            }
            // ,
            // js:{
            //   files: 'js/*.js',
            //   tasks: ['uglify']
            // }
        },
        imagemin : {
          dynamic : {
            files : [{
              optimizationLevel: 7,
              expand : true,
              cwd : 'images/',
              src : ['**/*.{png,jpg,gif,svg}'],
              dest : 'test/'
            }]
          }
        },
        postcss:{
            options:{
                map : true,
                processors: [
                    require('autoprefixer')({browsers:'last 2 versions'})
                ]
            },
            dist:{
                src: 'css/styles.css'
            }
        },
        uglify: {
          dist: {
            files: {
              'js/main.min.js': ['js/main.js']
            }
          }
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');

    grunt.registerTask('default', ['sass:dev', 'watch']);
    grunt.registerTask('build', ['sass:dist', 'postcss:dist', 'uglify:dist']);
    grunt.registerTask('images', ['imagemin']);
};