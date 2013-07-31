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
        'tasks/*.js',
        '<%= nodeunit.tests %>',
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
      src: 'spsql/*.sql',
      // dest path in which save the sp
      dest: 'spsql/',
      // sp regex to filter the function by name
      spRegex: '^(sp_|fn_).*',
      dumpFile: 'dumpDB.sql',
      sqlDir: 'sqls/',
      options: {
        results: {}
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean:', 'backupSP', 'restoreSP', 'runSQL:0:test', 'runSQL:test']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
