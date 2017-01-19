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
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-postcss');

    grunt.registerTask('default', ['sass:dev', 'watch']);
    grunt.registerTask('build', ['sass:dist', 'postcss:dist']);
};