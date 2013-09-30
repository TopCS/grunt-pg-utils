
// Internal Libs
var path = require('path');
// External Deps
var pg = require('pg'),
    cp = require('child_process'),
    S = require('string');
// Debugging dirtyness
var log = function (args, depth) { console.log(require('util').inspect(args, { colors: true, depth: depth })); };

module.exports = function (grunt) {
  grunt.registerMultiTask('restore', 'Dump a database using psql in your system', function () {
    var done = this.async();

    var options = this.options({
      psqlPath: 'psql'
    });
    if (!options.connection) {
      grunt.fatal(S('connection must be specified for {{name}} task').template({ name: this.name }));
    } else if (this.filesSrc.length !== 1 || typeof this.filesSrc[0]  !== 'string') {
      grunt.fatal(S('{{name}} task requires only one source file').template({ name: this.name }));
    }
    options.sourceFile = this.filesSrc[0];

    var psqlRestore = S('{{psqlPath}} "user={{user}} password={{password}} host={{host}} port={{port}}" -f {{sourceFile}}').template(options.connection);
    psqlRestore = psqlRestore.template(options);

    cp.exec(psqlRestore, function (err, stdout, stderr) {
      if (err) {
        grunt.fatal(err);
      }
      stdout = stdout.split('\n');
      stderr = stderr.split('\n');
      done();
    });

  });
};
