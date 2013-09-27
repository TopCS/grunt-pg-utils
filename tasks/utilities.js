// Internal Libs
var cp = require('child_process');

module.exports = function (grunt) {
  // Check installation of psql in the system
  grunt.registerTask('check-psql', 'Checks whether psql is installed or not in the system', function () {
    var done = this.async();
    cp.exec('psql --version', function (err, stdout, stderr) {
      if (err) { 
        if (err.code === 127) {
          grunt.log.errorlns('Using the test Task requires psql utility installed on your system, please check https://github.com/TopCS/grunt-pg-utils#testing');
          grunt.fatal(err);
        }
      }
      done();
    });
  });
  // Check installation of pg_dump in the system
  grunt.registerTask('check-pg_dump', 'Checks whether pg_dump is installed or not in the system', function () {
    var done = this.async();
    cp.exec('pg_dump --version', function (err, stdout, stderr) {
      if (err) {
        if (err.code === 127) {
          grunt.log.errorlns('Using the dump Task requires pg_dump installed on your system, please check https://github.com/TopCS/grunt-pg-utils#testing');
          grunt.fatal(err);
        }
      }
      done();
    });
  });
};
