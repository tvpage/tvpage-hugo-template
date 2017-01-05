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
                tasks: ['sass']
            }
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['sass:dev', 'watch']);
    grunt.registerTask('build', ['sass:dist']);
};