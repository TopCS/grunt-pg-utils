

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
