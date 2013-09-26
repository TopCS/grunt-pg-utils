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

  grunt.task.registerTask('backup-sp', 'Dump PostgresSQL stored procedures in separated files.', function () {
    var done = this.async(),
      pgClient = null,
      // Success count
      success = 0,
      // query
      listSPsql,
      listSP;

    var serverConfig = (this.args.length)? config.connections[parseInt(this.args[0], 10)] : config.connections[0];
    config.dest = config.dest || 'spsql/';
    listSPsql = "select " +
      "sp.proname as fname, " +
      "n.nspname as nspace, " +
      "sp.pronargs as fargs, " +
      "regexp_replace(CAST (sp.proargnames as text), '[\{\}]', '', 'g') as fargv, " +
      "pg_get_function_identity_arguments(sp.oid) as fargdesc, " +
      "pg_get_functiondef(sp.oid) as fdef, " +
      "ds.description as fdesc from " +
      "pg_proc as sp LEFT OUTER JOIN pg_description ds ON ds.objoid = sp.oid " +
        "INNER JOIN pg_namespace n ON sp.pronamespace = n.oid " +
        "WHERE sp.proname ~ '" + config.spRegex + "'";

    pgClient = new pg.Client(serverConfig);
    // Actually connecting to postgreSQL
    pgClient.connect();

    listSP = pgClient.query(listSPsql);
    listSP.on('row', function (sp, result) {
      var filename,
          filecontent,
          spcomment;

      filename = S('{{fname}} - {{fargs}}args ({{fargv}})' + '.sql').template(sp);
      filecontent = S("{{fdef}};\n").template(sp);
      if (sp.fdesc) {
        filecontent += S("COMMENT ON FUNCTION {{nspace}}.{{fname}}({{fargdesc}})\n" +
          "IS '{{fdesc}}'").template(sp);
      }

      grunt.file.write(config.dest + filename, filecontent);
      success++;
    });

    listSP.on('error', grunt.fail.fatal);
    listSP.on('end', function () {
      grunt.log.ok('Correctly backupped ' + success + ' stored procedures.');
      done();
    });
  });

  grunt.task.registerTask('restore-sp', 'Restore stored procedures.', function () {
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
