var pg = require('pg');

module.exports = function (grunt) {
  var config = grunt.config.get('pgutils'),
    _ = grunt.util._,
    log = function (args, depth) { console.log(require('util').inspect(args, { colors: true, depth: depth })); };


  grunt.task.registerTask('backupSP', 'Dump PostgresSQL stored procedures in separated files.', function () {
    var done = this.async(),
      pgClient = null,
      // Success count
      success = 0,
      query;

    var serverConfig = (this.args.length)? config.connections[parseInt(this.args[0], 10)] : config.connections[0];

    pgClient = new pg.Client(serverConfig);
    // Actually connecting to postgreSQL
    pgClient.connect();

    query = pgClient.query("select pg_get_functiondef(sp.oid) as functiondef, sp.proname as proname, sp.pronargs as pronargs from (select oid, proname, pronargs from pg_proc where proname ~ '" + config.spRegex + "') as sp");
    query.on('row', function (row, result) {
      grunt.file.write(config.dest + '/' + row.proname + '_' + row.pronargs + '.sql', row.functiondef);
      success++;
    });

    query.on('error', grunt.fail.fatal);
    query.on('end', function () {
      grunt.log.ok('Correctly backupped ' + success + ' stored procedures.');
      done();
    });
  });

  grunt.task.registerTask('restoreSP', 'Restore stored procedures.', function () {
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

    var serverConfig = (this.args.length)? config.connections[parseInt(this.args[0], 10)] : config.connections[0];

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

  grunt.task.registerTask('runSQL', 'Run SQL commands from file and return results for grunt use', function () {
    var done = this.async(),
      pgClient,
      query,
      results = [],
      sqlResultsName = config.sqlResultsName || 'results';

    var options = this.options();

    var serverConfig = (this.args.length > 1)? config.connections[parseInt(this.args[0], 10)] : config.connections[0];

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
