
// Internal Libs
var path = require('path');
// External Deps
var pg = require('pg'),
    cp = require('child_process'),
    S = require('string');
// Debugging dirtyness
var log = function (args, depth) { console.log(require('util').inspect(args, { colors: true, depth: depth })); };

module.exports = function (grunt) {
  grunt.registerTask('dump-execute', 'Dump a database using pg_dump in your system', function () {
    var done = this.async();
    
  });
  grunt.registerTask('dump', ['check-pg_dump', 'dump-execute']);

};
