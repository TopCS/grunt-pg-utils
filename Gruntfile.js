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
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
      spsql: ['spsql']
    },

    /**
     * Demo:
     *
     * 0) run-sql:create-db 
     *   Creates testdevel
     *   Creates teststage
     *   Creates testprodu
     *
     * 1) dump SP from testdevel to test/spsql/development
     * 2) restore SP from test/spsql/development to teststage
     * 3) restore SP from test/spsql/development to testprodu
     * 4) run-sql:delete-db
     *   Deletes testdevel
     *   Deletes teststage
     *   Deletes testprodu
     * 
     */

    // Configuration to be run (and then tested).
    'backup-sp': {
      development: {
        // dest path in which save the sp
        dest: 'test/spsql/development',
        options: {
          connection: {
            user: 'postgres',
            password: 'postgres',
            database: 'testdevel',
            host: '127.0.0.1'
          },
          // SP regex to filter the function by name
          spRegex: '^(sp_|fn_).*'
        }
      },
      stage: {
        // dest path in which save the sp
        dest: 'test/spsql/development',
        options: {
          connection: {
            user: 'postgres',
            password: 'postgres',
            database: 'teststage',
            host: '127.0.0.1'
          },
          // SP regex to filter the function by name
          spRegex: '^(sp_|fn_).*'
        }
      }
    },
    'restore-sp': {
      stage: {
        // src file that will be restored
        src: ['test/spsql/*.sql'],
        options: {
          connection: {
            'user': 'postgres',
            'password': 'postgres',
            'database': 'postgres',
            'host': '127.0.0.1'
          }
        }
      },
      production: {
        src: ['test/spsql/*.sql'],
        options: {
          connection: {
            'user': 'postgres',
            'password': 'postgres',
            'database': 'production',
            'host': '127.0.0.1'
          }
        }
      }
    },
    'run-sql': {
      test: {
        options: {
          connections: {
            'user': 'postgres',
            'password': 'postgres',
            'database': 'postgres',
            'host': '127.0.0.1'
          },
          src: ['spsql/*.sql']
        }
      }
    },
    /*'dump': {
      ...
    },
    'restore': {
  
    }*/
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

  // Whenever the 'test' task is run, first clean the 'tmp' dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'backup-sp', 'restore-sp:stage', 'run-sql:test', 'print-results']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
