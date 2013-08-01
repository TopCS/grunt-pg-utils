/*
 * grunt-pg-utils
 * https://github.com/TopCS/grunt-pg-utils
 *
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
      spsql: ['spsql']
    },

    // Configuration to be run (and then tested).
    pgutils: {
      // array of db connection parameters
      connections: [{
        "user": "postgres",
        "password": "postgres",
        "database": "postgres",
        "host": "127.0.0.1"
      }],
      // src file that will be restored
      src: 'test/spsql/*.sql',
      // dest path in which save the sp
      dest: 'test/spsql/',
      // sp regex to filter the function by name
      spRegex: '^(sp_|fn_).*',
      dumpFile: 'dumpDB.sql',
      // sqlDir to execute single task
      sqlDir: 'test/sqls/',
      // the result name in with save sql stuff default: results
      sqlResultsName: 'myname'

    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // A test function that print sql results from runSQL task
  grunt.registerTask('print-results', 'A simple task to print SQL results', function() {
    grunt.log.writeln(require('util').inspect(grunt.config.get('myname')));
  });

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'backupSP', 'restoreSP', 'runSQL:0:test', 'runSQL:test', 'print-results']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
