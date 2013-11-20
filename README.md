# grunt-pg-utils [![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/TopCS/grunt-pg-utils/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

> Grunt tasks for version control on PostgreSql stored procedures, automatized database restore/dump, query execution.

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

# Common options across tasks
All of the listed tasks are [gruntjs multitasks][gruntjs-multitasks], see the documentation about what this emplies.

### connection
For all the possible values in this object you can refer to [node-postgres config Object][node-postgres-options] documentation,
 `dump`, `restore` and `run-sql` tasks take a small subset of those options, since they are based off
  official postgres tools (`pg_dump`, `psql`).

Such subset is composed of:
```javascript
'dump/restore/run-sql': {
  targetname: {
    connection: {
      user: 'username',
      password: 'password',
      host: '127.0.0.1',
      port: 5432,
      database: 'dbname' // Only used in `run-sql` queries that affects a specific DB.
    }
  }
}
```

## The 'backup-sp' task

### Overview
Key task to backup the stored procedures in your database(s).  
It accepts a regex that is used to filter postgreSQL functions.

### Options
This task has a mandatory `dest` destination path, it _must_ be a directory and `options.connection` [as written here](#connection).

#### dest
Type: `gruntjs files` [documentation link][gruntjs-files] **REQUIRED**  
Default: **NONE**

#### options.spRegex
Type: `String` **REQUIRED**  
Example: `somefunc_[aeiou]*`  

PostgreSQL functions will be matched against this regex, if they do, they will be written as text file for version control.

#### options.filenameFormat
Type: `String` **OPTIONAL**  
Default: `{{fname}}-{{fargv}}.sql`  
Possible variables:

| Variable | Content | Example                                                                                            |
| -------- | ------- | -------------------------------------------------------------------------------------------------- |
| fname    | Function Name | fn_test_sp                                                                                   |
| nspace   | Function Namespace | public                                                                                  |
| fargs    | Function Arguments, number | 2                                                                               |
| fargv    | Function Arguments, type | (int, boolean)                                                                    |
| fargdesc | Function Arguments, extented type | (argname int, booleanvalue boolean)                                      |
| fdef     | Function Definition | `CREATE OR REPLACE FUNCTION public.fn_test_sp(argname int, booleanvalue boolean) ....` |
| fdesc    | Function Description | 'This is a Comment to the Function...'                                                |


## The 'restore-sp' task

### Overview
Task to restore a bunch of .sql files containing Stored Procedures definition(s).

### Options
This task has a mandatory `src` source file/array and `options.connection` [as written here](#connection).

#### src
Type: `gruntjs files` [documentation link][gruntjs-files] **REQUIRED**  
Default: **NONE**

## The 'dump' task

### Overview
Task to dump a database using the `pg_dump` utility present in your system.

### Options
This task has a mandatory `dest` file and `options.connection` [as written here](#connection), note this task has a subset of options as described.  
It **REQUIRE(S)** a database to be specified in `options.connection`.

#### dest
Type: `String` **REQUIRED**  
Default: **NONE**

It's a relative path string, it **MUST** be a _single_ file per target.

#### options.pgPath
Type: `String` **OPTIONAL**  
Default: `pg_dump`  

In case `pg_dump` utility is installed in a particular directory, put the complete path here.

## The 'restore' task

### Overview
Task to restore a (previously) dumped database, using `psql` utility present in your system.

### Options
This task has a mandatory `src` file and `options.connection` [as written here](#connection).
If an `options.connection.database` key is specified, it will be ignored, as it does not apply in this task.

#### src
Type: `String` **REQUIRED**  
Default: **NONE**

It's a relative path string, it **MUST** be a _single_ file per target.

#### options.psqlPath
Type: `String`  
Default: `psql`

In case `psql` utility is installed in a particular directory, put the complete path here.

## The 'run-sql' task

### Overview
Task that provides ability to run of arbitrary low or high level sql code.  
Uses `psql` utility present in your system.

### Options
This task has a mandatory `src` file/array and `options.connection` [as written here](#connection).
NOTE: Pay particular attention to `options.connection.database` on this task.

If you have some low-level queries (to be run without a database), you don't have to provide one.  
Otherwise, you need to provide one.  
If you have mixed queryes, for example: some that creates a database, some others that creates tables.  
You shall create 2 grunt targets, one with an `options.connection.database` specified (the former), and the latter without.

#### src
Type: `gruntjs files` [documentation link][gruntjs-files] **REQUIRED**  
Default: **NONE**

#### options.psqlPath
Type: `String`  
Default: `psql`

In case `psql` utility is installed in a particular directory, put the complete path here.

### Example Gruntfile.js
Refer to [`Gruntfile.js`][gruntfile] for extended usage example

```javascript
module.exports = function (grunt) {
  var dbConnection = {
    user: 'postgres',
    password: 'postgres',
    database: 'dbname',
    host: 'localhost',
    port: 5432
  };

  grunt.initConfig({
    'backup-sp': {
      demotarget: {
        dest: 'spsql/dbname/',
        options: {
          connection: dbConnection,
          spRegex: '^(sp_|fn_).*',
          filenameFormat: '{{nspace}}.{{fname}}-{{fargv}}.sql'
        }
      }
    },
    'restore-sp': {
      demotarget: {
        src: 'spsql/dbname/*.sql',
        options: {
          connection: dbConnection
        }
      }
    },
    clean: ['spsql']
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-pg-utils');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'backup-sp']);
  grunt.registerTask('restore', ['restore-sp']);

};
```

Than you can than use:
```shell
$ grunt backup-sp
$ grunt restore-sp:1
```

## Contributing
We would be happy to accept external contributions, would this be pull requests, issues, or general encouragement.

### Developer environment
Requirements:

  * Postgres 9.x installation
  * Postgres 9.x utilities
  * Configure such postgreSQL instllation in [`Gruntfile.js`][gruntfile]

Edit `Gruntfile.js` with your credentials:
```
var defUser = 'postgres',
    defPassword = 'postgres',
    defHost = '127.0.0.1',
    defPort = 5432;
```

  * Run tests: `grunt test`

## Release History

 * 01/10/2013 v0.1.0 Multitask release
 * 06/08/2013 v0.0.2 Progress release
                - Implement a task to run SQL files
                - Add multiple servers ability
                - Include tests
 * 30/07/2013 v0.0.1 Initial release

[gruntfile]: Gruntfile.js
[node-postgres-options]: https://github.com/brianc/node-postgres/wiki/Client#new-clientobject-config--client
[gruntjs-files]: http://gruntjs.com/configuring-tasks#files
[gruntjs-multitasks]: http://gruntjs.com/creating-tasks#multi-tasks
