# ci-gulp

Continuous Integration (CI) with Gulp

## Description

A strongly opinionated way of structure your CI _actions_ in order to both document and automate them.

The main purpose is to help writing down each _action_ that the team perform as a part of the software development process.

Releasing a new version is the most common first _action_. 

## Instalation

```bash
npm install ci-gulp --save
```

## API

### action(name, steps, mappers)

Defines a new action. `name` is a string (could be like "ReleaseNewVersion"), `steps` is an array of an array of _task names_ (string) and `mappers` is an object defining arguments.

### task(name, manual, gulpTask)

Defines a new task. `name` is a string (could be like "pom:version:bump"), `manual` is an array of manual instructions (string) and `gulpTask` is the automated task (optional).

## Example

Lets asume that sometimes we "ReleaseNewVersion", that means that some `version` field in a `package.json` (or `pom.xml`) needs to be updated. Then we use to publish to the community with `npm publish` (or `mvn deploy`).

The "ReleaseNewVersion" action definition:

```javascript
const ciGulp = require('ci-gulp');

ciGulp.action('ReleaseNewVersion', [
    // Step 1
    ['package:min-version:bump'],
    // Step 2
    ['npm:publish']
]);
```

The "package:min-version:bump" task definition:

```javascript
const ciGulp = require('ci-gulp');

ciGulp.task('package:min-version:bump', () => [
    'Please follow the next steps:',
    '1. Open package.json',
    '2. Update the version attribute'
]);
```

The "npm:publish" task definition:

```javascript
const ciGulp = require('ci-gulp');

ciGulp.task('npm:publish', () => [
    'Please follow the next steps:',
    '1. Open a terminal',
    '2. Execute: npm publish'
]);
```

This will allow you to:

* Run `gulp ReleaseNewVersion` and follow the instructions in order to avoid jumping steps
* Run `gulp ReleaseNewVersion.md` and create a markdown document for humans.
* Run `gulp ci-gulp:statistics` and list the longer task to speed up your work.

With [gulp-bump](https://www.npmjs.com/package/gulp-bump) to bump `package.json` version attribute one task could be automated: 

```javascript
var gulp = require('gulp');
var bump = require('gulp-bump');
const ciGulp = require('ci-gulp');

ciGulp.task(
    'npm:publish',
    () => [
        'Please follow the next steps:',
        '1. Open a terminal',
        '2. Execute: npm publish'
    ],
    () => {
        gulp.src('./package.json')
            .pipe(bump())
            .pipe(gulp.dest('./'));
    }
);
```

## Demo 

Take a look in [demo](./demo) folder.

## Usage

Create a folder with the following structure:

```
 + process
    |- actions
    |- tasks
    gulpfile.js
    package.json
```

File `gulpfile.js`:

```javascript
// Module to require whole directories
const requireDir = require('require-dir');

requireDir('./tasks', {recurse: false});
requireDir('./actions', {recurse: false});
```

Folder `action` will keep the actions while folder `tasks` the tasks.


## Manual instructions

Manual instructions are mandatory to `ci-gulp` because you don't want to loose that knowledge. Also it will let you document each _action_.

Manual instructoins will be the fallback mechanism in case you couldn't automate a task. Statistics will help you identify the bests (longers) tasks to automate at first.

Manual instruction are optional anyway because you could define task using gulp as always.

## Parameters: Using Mappers

Parameters are available to customize manual instruction.

> File `tasks/jira.js`:

```javascript
const ciGulp = require('ci-gulp');

ciGulp.task('jira:task:open', (args) => [
    'Please follow the next steps:',
    '1. Open jira',
    `2. Find task ${args.jiraTask}`,
    '3. Update task state to "Open"',
]);

ciGulp.task('jira:task:close', (args) => [
    'Please follow the next steps:',
    '1. Open jira',
    `2. Find task ${args.jiraTask}`,
    '3. Update task state to "Closed"',
    `4. Add comment: Please review ${args.featureBranch}`,
]);

```

In order to define values for the parameters needed, you need to set the action mappers.

> File `actions/feature-start.js`:

```javascript
const ciGulp = require('ci-gulp');

ciGulp.action('FeatureStart',
    [
        // Step 1: Checkout
        ['git:checkout:develop'],
        // Step 2: Open
        ['git:branch:feature', 'github-ticket:state:open'],
    ],
    { // mappers:

        // args.featureId will take the value from CLI parameter --feature-id
        featureId: 'feature-id',

        // args.codeFreezeBranch will be set as 
        //  "fb-" prefix plus ...
        //  CLI parameter --feature-id 
        codeFreezeBranch: (args) => `fb-${args.featureId}`
    }
);
```

> Note: an CLI argument will be required `--jiraTask ###`


