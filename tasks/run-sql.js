

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

  grunt.task.registerMultiTask('run-sql', 'Run SQL commands from file and return results for grunt use', function () {
    var done = this.async(),
      pgClient,
      query,
      results = [];

    var options = this.options({
      connection: {},
      sqlDir: 'sqls/',
      sqlResultsName: 'results',
    });

    pgClient = new pg.Client(options.connection);
    pgClient.connect();

    query = pgClient.query(grunt.file.read(options.sqlDir + /* idea needed here */ this.args[this.args.length - 1] + '.sql'));
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
