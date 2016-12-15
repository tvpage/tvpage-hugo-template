module.exports = function(grunt) {

  grunt.initConfig({
    requirejs: {
      compile: {
        options: {
          mainConfigFile: "build.js"
        }
      }
    },
    cssmin: {
      target: {
        files: {
          "dist/css/main.css": ['css/index.css']
        }
      }
    },
    autoprefixer: {
      css: {
        files: {
          src: "dist/css/main.css",
          dest: "dist/css/main.css"
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('js', ['requirejs']);
  grunt.registerTask('css', ['cssmin']);

};