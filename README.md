# ci-gulp

Continuous Integration (CI) with Gulp

## Goal

A strongly opinionated way of structure your CI actions in order to both document and automate them.

## Instalation

```bash
npm install ci-gulp --save
```

## Usage

Define any CI _action_ (like `BuildDevelop`, `ReleaseCandidate` or even `StartFeature`) as a set of _steps_ which are define by _tasks_.

In order to run a CI _action_ run `gulp [action]` (like `gulp BuildDevelop`, `gulp ReleaseCandidate`)

_Actions_ should be located in `actions` folder and file name must mach _action_ name.

> File `actions/build-develop.js`:

```javascript
// Module to require whole directories
const ciGulp = require('ci-gulp');

ciGulp.action('BuildDevelop', [
    // Step 1
    ['jenkins:develop:build'],
    // Step 2
    ['deploy:develop:node1', 'deploy:develop:node2'],
    // Step 3
    ['tests:e2e']
]);
```

Then each task must be defined in its matching file.

> File `tasks/jenkins.js`:

```javascript
// Module to require whole directories
const ciGulp = require('ci-gulp');

ciGulp.task('jenkins:develop:build', () => [
    'Please follow the next steps:',
    '1. Open jenkins',
    '2. Find task "Build Develop" and execute it'
]);
```

A CI _task_ is a gulp task, but could be something more:

```javascript
gulp.task(
    'a-gulp-task',
    (done) => {
        console.log('a-gulp-task OK');
        done();
    }
);
// could have Human instructions
ciGulp.task(
    'a-gulp-task',
    () => [
        // Human instructions
        'Please follow the next steps:',
        '1. Open jenkins',
        '2. Find task "Build Develop" and execute it'
    ], (done) => {
        console.log('a-gulp-task OK');
        done();
    }
);
```

Human instructions are mandatory to `ci-gulp` because you don't want to loose that knowledge. Also it will let you document each CI _action_.

Human instructoins will be the fallback mechanism in case you couldn't automate a task. Statistics will help you identify the bests (longers) tasks to automate at first.

Human instruction are optional anyway because you could define task using gulp as always.

### Parameters

Parameters are available to customize Human instruction.

> File `tasks/jira.js`:

```javascript
// Module to require whole directories
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

> File `actions/feature.js`:

```javascript
// Module to require whole directories
const ciGulp = require('ci-gulp');

ciGulp.action('feature',
    [
        // Step 1: Checkout
        ['git:checkout:develop'],
        // Step 2: Open
        ['git:branch:feature', 'github-ticket:state:open'],
    ], {
        // mappers:
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

## Structure

Somewhere in the project that is going to be managed, create the following structure:

```
 + ci-actions
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
