// Internal Libs
var path = require('path');
// External Deps
var pg = require('pg'),
    async = require('async'),
    S = require('string');
// Debugging dirtyness
var log = function (args, depth) { console.log(require('util').inspect(args, { colors: true, depth: depth })); };

module.exports = function (grunt) {
  grunt.task.registerMultiTask('backup-sp', 'Dump PostgresSQL stored procedures in separated files.', function () {
    var done = this.async(),
      pgClient,
      // Success count
      success = 0,
      // query
      listSPsql,
      listSP,
      destinationPath;

    var options = this.options({
      filenameFormat: '{{fname}}-N{{fargs}}.sql'
    });

    // Check configuration, i don't trust the user.
    if (!options.spRegex) {
      grunt.fatal(S('spRegex must be specified for {{name}} task').template({ name: this.name }));
    } else if (!options.connection) {
      grunt.fatal(S('connection must be specified for {{name}} task').template({ name: this.name }));
    } else if (this.files.length !== 1 || typeof this.files[0].dest  !== 'string') {
      // MKDIR HERE
      grunt.fatal(S('{{name}} task requires only one destination folder').template({ name: this.name }));
    }

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
    destinationPath = this.files[0].dest;

    pgClient = new pg.Client(options.connection);
    // Actually connecting to postgreSQL
    async.waterfall([
      function connect(callback) {
        pgClient.connect(callback);
      },
      function getStoredProcedures(pgInstance, callback) {
        listSP = pgInstance.query(listSPsql);
        listSP.on('row', function (sp, result) {
          var filename,
              filecontent;

          // Compile filename format
          filename = S(options.filenameFormat).template(sp);
          // Fill the file content
          filecontent = S("{{fdef}};\n").template(sp);
          // In case the SP has some description, add to the file content.
          if (sp.fdesc) {
            filecontent += S("COMMENT ON FUNCTION {{nspace}}.{{fname}}({{fargdesc}})\n" +
              "IS '{{fdesc}}'").template(sp);
          }

          grunt.file.write(path.join(destinationPath, filename.toString()), filecontent);
          success++;
        });

        listSP.on('error', callback);
        listSP.on('end', callback.bind(this, null));
      }
    ],
    function (err) {
      if (err) {
        return grunt.fatal(err);
      }
      grunt.log.ok(S('Correctly backupped {{howmany}} stored procedures.').template({ howmany: success }));
      done();
    });
  });
};
