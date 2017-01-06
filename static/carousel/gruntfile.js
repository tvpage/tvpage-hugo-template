module.exports = function(grunt) {

    grunt.initConfig({
        watch: {
            js: {
                files: ['src/js/**/*.js'],
                tasks: ['requirejs']
            },
            css: {
                files: ['src/scss/**/*.scss'],
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
        var exported = grunt.file.write(exportPath+'/css.html', grunt.file.read('./dist/css-lib.css'));
        if (exported) {
            grunt.log.ok('exported!');
        }
    });
    
    grunt.registerTask('dev', ['watch']);

};