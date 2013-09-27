

var path = require('path'),
  pg = require('pg'),
  cp = require('child_process'),
  S = require('string'),
  async = require('async');

module.exports = function (grunt) {
  var log = function (args, depth) { console.log(require('util').inspect(args, { colors: true, depth: depth })); };

  grunt.task.registerMultiTask('run-sql', 'Run SQL commands from file and return results for grunt use', function () {
    var done = this.async(),
      pgClient,
      query,
      results = [],
      file, sqlFiles;

    var options = this.options({
      connection: {},
      files: ['sqls/*.js'],
      sqlResultsName: 'results',
    });

    sqlFiles = grunt.file.expand(options.src);

    pgClient = new pg.Client(options.connection);
    pgClient.connect();

    async.each (sqlFiles, function(file) {
      console.log(file);
      query = pgClient.query(grunt.file.read(file));
      query.on('row', function (row, result) {
        results.push(row);
      });

      query.on('error', grunt.fail.fatal);
      query.on('end', function () {
        grunt.config(sqlResultsName, results);
      });
    },
    function(err){
      done();
    });
  });

};
