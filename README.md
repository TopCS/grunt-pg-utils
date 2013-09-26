# grunt-pg-utils

> Grunt tasks for version control on PostgreSql stored procedures, and various utilities.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-pg-utils --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-pg-utils');
```

## The "pgutils" task

### Configuration

All the following options are **REQUIRED**.

##### pgutils.connections
Type: `Array`
Default value: `null`

An array of Objects to be passed to ```pg.Client()```, read [node-postgres documentation][pgclientdoc] for possible options.

##### pgutils.src
Type: `String`  
Default value: `null`  
Example: `somedir/*.sql`

Source path for Stored Procedures, used for the restore Task.

##### pgutils.dest
Type: `String`  
Default value: `null`  
Example: `somedir` or `somedir/` or `/complete/url/to/path/`

Destination path for Stored Procedures, used for the backup Task.

##### pgutils.spRegex
Type: `Regexp`  
Default value: `null`  
Example: `somefunc_[aeiou]*`

Regexp used to filter the name of the Stored Procedures, used for the backup Task.

### Example Gruntfile.js

```javascript
module.exports = function (grunt) {

  grunt.initConfig({
    pgutils: {
      connections: [{
        "user": "postgres",
        "password": "postgres",
        "database": "postgres",
        "host": "127.0.0.1"
      },
      {
        "user": "postgres",
        "password": "postgres",
        "database": "production",
        "host": "127.0.0.1"
      }],
      src: 'spsql/*.sql',
      dest: 'spsql/',
      spRegex: '^(sp_|fn_).*'
    },
    clean: ['spsql']
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-pg-utils');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'pgutils:backup-sp']);
  grunt.registerTask('restore', ['pgutils:restore-sp']);

};
```

Than you can than use:
```shell
$ grunt backup-sp    #backup from the db #0
$ grunt restore-sp:1 #restore to db #1
```

## Contributing
We would be happy to accept external contributions, would this be pull requests, issues, or general encouragement.

### Developer environment
Requirements:

  * Postgres 9.x installation
  * Empty database to run tests
  * Configure such database in [`Gruntfile.js`][gruntfile]


`Gruntfile.js` section to edit
```
  pgutils: {
    // array of db connection parameters
    connections: [{
      "user": "postgres",
      "password": "postgres",
      "database": "postgres",
      "host": "127.0.0.1"
    }]
  }
```

  * Run tests: `grunt test`

## Release History

 * 06/08/2013 v0.0.2 Progress release
                - Implement a task to run SQL files
                - Add multiple servers ability
                - Include tests
 * 30/07/2013 v0.0.1 Initial release

[pgclientdoc]: https://github.com/brianc/node-postgres/wiki/Client#new-client_object_-config--client
[gruntfile]: Gruntfile.js
