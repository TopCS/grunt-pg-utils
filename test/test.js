// Internal Libs
var cp = require('child_process');
// External Deps
var async = require('async'),
    S = require('string');
// Debugging dirtyness
var log = function (args, depth) { console.log(require('util').inspect(args, { colors: true, depth: depth })); };

module.exports = function (grunt) {

  var connectionOpts = {
    user: 'postgres',
    pass: 'postgres',
    host: '127.0.0.1',
    port: '5432'
  };

  grunt.registerTask('create-test-db-execute', 'Creates databases for testing', function () {
    var psqlCreate = S('psql "user={{user}} password={{pass}} host={{host}} port={{port}}" -f test/sqls/create-test-db.sql').template(connectionOpts).toString();
    var done = this.async();

    cp.exec(psqlCreate, function (err, stdout, stderr) {
      if (err) {
        grunt.fatal(err);
      }
      stdout = stdout.split('\n');
      stderr = stderr.split('\n');
      // psql should have returned ERROR: database "namehere" already exists
      if (stderr.length > 1) {
        grunt.log.errorlns('Manually run grunt drop-test-db, and try again. If problem persist call for an Issue https://github.com/TopCS/grunt-pg-utils/issues');
        grunt.fatal(stderr);
      }
      done();
    });
  });
  // Use create-test-db instead of create-test-db-execute
  grunt.registerTask('create-test-db', ['check-psql', 'create-test-db-execute']);

  grunt.registerTask('drop-test-db-execute', 'Drops databases for testing', function () {
    var psqlDrop = S('psql "user={{user}} password={{pass}} host={{host}} port={{port}}" -f test/sqls/drop-test-db.sql').template(connectionOpts).toString();
    var done = this.async();

    cp.exec(psqlDrop, function (err, stdout, stderr) {
      if (err) {
        grunt.fatal(err);
      }
      stdout = stdout.split('\n');
      stderr = stderr.split('\n');
      done();
    });
  });
  // Use drop-test-db instead of drop-test-db-execute
  grunt.registerTask('drop-test-db', ['check-psql', 'drop-test-db-execute']);

  grunt.registerTask('test', ['clean', 'create-test-db']);

};
