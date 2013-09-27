// Internal Libs
var path = require('path');
// External Deps
var pg = require('pg'),
    async = require('async'),
    S = require('string');
// Debugging dirtyness
var log = function (args, depth) { console.log(require('util').inspect(args, { colors: true, depth: depth })); };

module.exports = function (grunt) {
  grunt.task.registerMultiTask('restore-sp', 'Restore stored procedures.', function () {
    var done = this.async(),
      pgClient,
      // Error and Success count
      errors = [],
      success = 0,
      sourceArray = this.filesSrc;

    var options = this.options();
    if (!options.connection) {
      grunt.fatal(S('connection must be specified for {{name}} task').template({ name: this.name }));
    }

    pgClient = new pg.Client(options.connection);
    async.waterfall([
      function connect(callback) {
        pgClient.connect(callback);
      },
      function putStoredProcedures(pgInstance, callback) {
        // Create an array containing all the code in the stored procedures.
        var spArray = sourceArray.filter(function (sourceFile) {
          // Double-check for nonexistent files
          if (!grunt.file.exists(sourceFile)) {
            grunt.log.warn(S('Source file {{path}} not found.').template({ path: sourceFile }));
            return false;
          } else {
            return true;
          }
        }).map(function (sourceFile) {
          return grunt.file.read(sourceFile);
        });

        // Execute the restore
        async.eachSeries(spArray, function (sp, spCallback) {
          pgInstance.query(sp, function (err, pgResponse) {
            if (err) {
              errors.push(err);
            } else {
              success++;
            }
            spCallback();
          });
        }, callback);
      }
    ],
    function (err) {
      if (err) {
        return grunt.fatal(err);
      }
      if (errors.length) {
        grunt.log.error(S('{{howmany}} Errors occurred, listing them:').template({ howmany: errors.length }));
        errors.forEach(function (error, index) {
          grunt.log.errorlns(S('{{index}}) error: {{error}}').template({ index: index, error: error }));
        });
      }
      grunt.log.ok(S('Correctly restored {{howmany}} stored procedures.').template({ howmany: success }));
      done();
    });
  });
};
