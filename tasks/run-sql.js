// External Deps
var pg = require('pg'),
    async = require('async'),
    cp = require('child_process'),
    S = require('string');
// Debugging dirtyness
var log = function (args, depth) { console.log(require('util').inspect(args, { colors: true, depth: depth })); };

module.exports = function (grunt) {
  grunt.registerMultiTask('run-sql', 'Executes a valid .sql file towards a database, using psql in your system', function () {
    var done = this.async(),
        dbName = '',
        sourceArray = this.filesSrc,
        spOutcome = {},
        success = 0;

    var options = this.options({
      psqlPath: 'psql'
    });
    if (!options.connection) {
      grunt.fatal(S('connection must be specified for {{name}} task').template({ name: this.name }));
    }

    if (options.connection.database) {
      dbName = ' dbname={{database}}';
    }

    var psqlRestore = S('{{psqlPath}} "user={{user}} password={{password}} host={{host}} port={{port}}' + dbName + '" -f {{sourceFile}}').template(options.connection);
    psqlRestore = psqlRestore.template(options);

    sourceArray = sourceArray.filter(function (sourceFile) {
      // Double-check for nonexistent files
      if (!grunt.file.exists(sourceFile)) {
        grunt.log.warn(S('Source file {{sourceFile}} not found.').template({ sourceFile: sourceFile }));
        return false;
      } else {
        return true;
      }
    });
    sourceArray.forEach(function (sourceFile) {
      spOutcome[sourceFile] = {
        sourceFile: sourceFile,
        sourceCode: grunt.file.read(sourceFile),
        stdout: [],
        stderr: []
      };
    });

    async.eachSeries(sourceArray, function (sp, callback) {
      var executeSql = psqlRestore.template(spOutcome[sp]);

      cp.exec(executeSql, function (err, stdout, stderr) {
        spOutcome[sp].stdout = stdout.split('\n');
        spOutcome[sp].stderr = stderr.split('\n');
        // Pop last (ALWAYS EMPTY!) array item
        spOutcome[sp].stdout.pop();
        spOutcome[sp].stderr.pop();
        callback();
      });
    },
    function (err) {
      if (err) {
        grunt.fatal(err);
      }
      sourceArray.forEach(function (sp) {
        if (spOutcome[sp].stderr.length > 0) {
          spOutcome[sp].stderr.forEach(function (error) {
            grunt.log.error(error);
          });
        } else {
          success++;
        }
      });
      grunt.log.ok(S('Correctly run {{howmany}} files.').template({ howmany: success }));
      done();
    });

  });
};
