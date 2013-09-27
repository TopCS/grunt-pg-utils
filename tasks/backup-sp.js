// Internal Libs
var path = require('path');
// External Deps
var pg = require('pg'),
    cp = require('child_process'),
    S = require('string');

module.exports = function (grunt) {
  var log = function (args, depth) { console.log(require('util').inspect(args, { colors: true, depth: depth })); };

  grunt.task.registerMultiTask('backup-sp', 'Dump PostgresSQL stored procedures in separated files.', function () {
    var done = this.async(),
      pgClient = null,
      // Success count
      success = 0,
      // query
      listSPsql,
      listSP;

    var options = this.options({
      connection: {},
      spRegex: '^(sp_|fn_).*',
      dest: 'spsql/',
      filenameFormat: '{{fname}}-N{{fargs}}.sql'
    });

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
        "WHERE sp.proname ~ '" + options.spRegex + "'";

    pgClient = new pg.Client(options.connection);
    // Actually connecting to postgreSQL
    pgClient.connect();

    listSP = pgClient.query(listSPsql);
    listSP.on('row', function (sp, result) {
      var filename,
          filecontent,
          spcomment;

      filename = S(options.filenameFormat).template(sp);
      filecontent = S("{{fdef}};\n").template(sp);
      if (sp.fdesc) {
        filecontent += S("COMMENT ON FUNCTION {{nspace}}.{{fname}}({{fargdesc}})\n" +
          "IS '{{fdesc}}'").template(sp);
      }

      grunt.file.write(options.dest + filename, filecontent);
      success++;
    });

    listSP.on('error', grunt.fail.fatal);
    listSP.on('end', function () {
      grunt.log.ok('Correctly backupped ' + success + ' stored procedures.');
      done();
    });
  });

};
