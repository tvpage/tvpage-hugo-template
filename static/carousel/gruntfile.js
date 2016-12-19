module.exports = function(grunt) {

    grunt.initConfig({
        watch: {
            js: {
                files: ['src/js/**/*.js'],
                tasks: ['clean:js', 'requirejs']
            },
            css: {
                files: ['src/scss/**/*.scss'],
                tasks: ['clean:css', 'sass']
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
            dist: {
                options: {
                    noCache: true,
                    sourcemap: false,
                    compas: true,
                    require: ['breakpoint'],
                    style: 'expanded'
                },
                files: {
                    'dist/css-lib.css': 'src/scss/styles.scss'
                }
            }
        },
        clean: {
            js: 'dist/js-lib.js',
            css: 'dist/css-lib.css'
        },
        // copy: {
        //     js: {
        //         cwd: './dist',
        //         expand: true,
        //         src: 'js-lib.js',
        //         dest: 'templates/page'
        //     },
        //     css: {
        //         cwd: './dist',
        //         expand: true,
        //         src: 'css-lib.css',
        //         dest: 'templates/page'
        //     }
        // },
        autoprefixer: {
            css: {
                files: {
                    'dist/css-lib.css': 'dist/css-lib.css'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('js', ['requirejs', 'watch:js']);
    grunt.registerTask('css', ['sass', 'autoprefixer', 'watch:css']);

};
