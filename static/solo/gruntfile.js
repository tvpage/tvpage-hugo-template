module.exports = function(grunt) {

    grunt.initConfig({
        watch: {
            js: {
                files: ['src/js/**/*.js'],
                tasks: ['requirejs']
            },
            css: {
                files: ['src/scss/**/*.scss'],
                tasks: ['sass', 'autoprefixer', 'export']
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
            options: {
                sourceMap: false
            },
            dist: {
                files: {
                    'dist/css-lib.css': 'src/scss/styles.scss'
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
        export: {
            target: {}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-watch');

    var exportPath = '../../layouts/partials/solo';
    grunt.registerMultiTask('export', 'Export css to partials', function() {
        var css = grunt.file.write(exportPath+'/css.html', grunt.file.read('./dist/css-lib.css'));
        if (css) {
            grunt.log.ok('CSS exported');
        }
    });
    
    grunt.registerTask('dev', ['watch']);

};