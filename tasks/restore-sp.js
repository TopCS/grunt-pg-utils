
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

  grunt.task.registerMultiTask('restore-sp', 'Restore stored procedures.', function () {
    var done = this.async(),
      async = grunt.util.async,
      pgClient,
      // File listing
      sqlFiles,
      filesIterator = 0,
      // Error and Success count
      errors = [],
      success = 0,
      query;

    var options = this.options({
      connection: {},
      sqlDir: 'sqls/',
      src: 'spsql/*.js',
    });

    pgClient = new pg.Client(options.connection);

    // Actually connecting to postgreSQL
    pgClient.connect();

    sqlFiles = grunt.file.expand(options.src);

    async.whilst(
      function () {
        return filesIterator < sqlFiles.length;
      },
      function (callback) {
        pgClient.query(grunt.file.read(sqlFiles[filesIterator]), function (err, result) {
          if (err) {
            errors.push(err);
            callback();
          } else {
            success++;
            callback();
          }
        });
        filesIterator++;
      },
      function (err) {
        if (errors.length) {
          grunt.log.error(errors.length + ' Errors occurred, listing them:');
          _.forEach(errors, function (value, index) {
            grunt.log.errorlns(value);
          });
        }
        grunt.log.ok('Correctly restored ' + success + ' stored procedures.');
        done();
      }
    );
  });

};
