module.exports = function(grunt) {

    grunt.initConfig({
        watch: {
            js: {
                files: ['js/**/*.js'],
                tasks: ['requirejs']
            },
            css: {
                files: ['sass/**/*.scss'],
                tasks: ['sass', 'autoprefixer', 'exportcss']
            }
        },
        requirejs: {
            compile: {
                options: {
                    mainConfigFile: 'build.js'
                }
            }
        },
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
        autoprefixer: {
            css: {
                files: {
                    'dist/css-lib.css': 'dist/css-lib.css'
                }
            }
        },
        exportcss: {
            target: {}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-watch');

    var exportPath = '../../layouts/partials/carousel';
    grunt.registerMultiTask('exportcss', 'Export css to partials folder', function() {
        var exported = grunt.file.write(exportPath+'/css-base.html', grunt.file.read('./css/styles.css'));
        if (exported) {
            grunt.log.ok('exported!');
        }
    });
    
    grunt.registerTask('dev', ['watch']);

};