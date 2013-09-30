
// Internal Libs
var path = require('path');
// External Deps
var pg = require('pg'),
    cp = require('child_process'),
    S = require('string');
// Debugging dirtyness
var log = function (args, depth) { console.log(require('util').inspect(args, { colors: true, depth: depth })); };

module.exports = function (grunt) {
  grunt.registerMultiTask('dump', 'Dump a database using pg_dump in your system', function () {
    var done = this.async();

    var options = this.options({
      pgPath: 'pg_dump'
    });
    if (!options.connection) {
      grunt.fatal(S('connection must be specified for {{name}} task').template({ name: this.name }));
    } else if (this.files.length !== 1 || typeof this.files[0].dest  !== 'string') {
      grunt.fatal(S('{{name}} task requires only one destination file').template({ name: this.name }));
    }
    options.outputFile = this.files[0].dest;

    var pgDump = S('{{pgPath}} "user={{user}} password={{password}} host={{host}} port={{port}} dbname={{database}}" -f {{outputFile}}').template(options.connection);
    pgDump = pgDump.template(options);

    cp.exec(pgDump, function (err, stdout, stderr) {
      if (err) {
        grunt.fatal(err);
      }
      stdout = stdout.split('\n');
      stderr = stderr.split('\n');
      done();
    });

  });
};
