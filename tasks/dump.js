
// Internal Libs
var path = require('path');
// External Deps
var pg = require('pg'),
    cp = require('child_process'),
    S = require('string');

module.exports = function (grunt) {
  var config = grunt.config.get('pgutils'),
    _ = grunt.util._,
    log = function (args, depth) { console.log(require('util').inspect(args, { colors: true, depth: depth })); };


  grunt.task.registerTask('dump', 'Dump a database using pg_dump in your system', function () {
    var done = this.async();

    // Check installation of pg_dump in the system
    cp.exec('pg_dump', function (err, stdout, stderr) {
      if (err) {
        if (err.code === 127) {
          grunt.fail.fatal('Using the dump Task requires pg_dump installed on your system, please check https://github.com/adunstan/postgresql-dev/tree/master/src/bin/pg_dump');
        }
      }
    });

  });

};