module.exports = function(grunt) {

  grunt.initConfig({
    sass: {
      options: {
        sourceMap: true,
        outputStyle: 'compressed'
      },
      dist: {
        files: {
          'bootstrap/dist/css/bootstrap.css' : 'bootstrap/scss/main.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('default', ['sass']);

};