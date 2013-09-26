
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

    var serverConfig = (this.args.length) ? config.connections[parseInt(this.args[0], 10)] : config.connections[0];
    config.src = config.src || 'spsql/*.js';

    pgClient = new pg.Client(serverConfig);

    // Actually connecting to postgreSQL
    pgClient.connect();

    sqlFiles = grunt.file.expand(config.src);

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

  grunt.task.registerTask('run-sql', 'Run SQL commands from file and return results for grunt use', function () {
    var done = this.async(),
      pgClient,
      query,
      results = [];

    config.sqlDir = config.sqlDir || 'sqls/';
    var sqlResultsName = config.sqlResultsName || 'results';
    var serverConfig = (this.args.length > 1) ? config.connections[parseInt(this.args[0], 10)] : config.connections[0];
    var options = this.options();


    pgClient = new pg.Client(serverConfig);
    pgClient.connect();

    query = pgClient.query(grunt.file.read(config.sqlDir + this.args[this.args.length - 1] + '.sql'));
    query.on('row', function (row, result) {
      results.push(row);
    });

    query.on('error', grunt.fail.fatal);
    query.on('end', function () {
      grunt.config(sqlResultsName, results);
      done();
    });
  });

};
