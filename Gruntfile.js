/*
 * grunt-pg-utils
 * https://github.com/TopCS/grunt-pg-utils
 *
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var defUser = 'postgres',
      defPassword = 'postgres',
      defHost = '127.0.0.1',
      defPort = 5432;

  var serverConnection = {
    user: defUser,
    password: defPassword,
    host: defHost,
    port: defPort
  },
  stageConnection = {
    user: defUser,
    password: defPassword,
    database: 'grunt-teststage',
    host: defHost,
    port: defPort
  },
  developmentConnection = {
    user: defUser,
    password: defPassword,
    database: 'grunt-testdevel',
    host: defHost,
    port: defPort
  };

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
      spsql: ['spsql']
    },

    // Configuration to be run (and then tested).
    'backup-sp': {
      'backup-testdevel': {
        dest: 'tmp/testdevel/',
        options: {
          connection: developmentConnection,
          spRegex: '^(sp_|fn_).*'
        }
      }
    },
    'restore-sp': {
      'test-procedures': {
        src: ['test/spsql/*.sql'],
        options: {
          connection: developmentConnection
        }
      },
      'restore-teststage': {
        src: ['tmp/testdevel/*.sql'],
        options: {
          connection: stageConnection
        }
      }
    },
    dump: {
      'dump-testdevel': {
        dest: 'tmp/testdevel.sql',
        options: {
          connection: developmentConnection
        }
      }
    },
    restore: {
      'restore-testdevel': {
        src: 'tmp/dumpdevel.sql',
        options: {
          connection: serverConnection
        }
      }
    },
    'run-sql': {
      'create-test-db': {
        src: 'test/sqls/create-test-db.sql',
        options: {
          connection: serverConnection
        }
      },
      'drop-test-db': {
        src: 'test/sqls/drop-test-db.sql',
        options: {
          connection: serverConnection
        }
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Whenever the 'test' task is run, first clean the 'tmp' dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'run-sql:create-test-db', 'restore-sp:test-procedures', 'backup-sp:backup-testdevel', 'dump:dump-testdevel', 'restore-sp:restore-teststage', 'run-sql:drop-test-db']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
