const ciGulp = require('ci-gulp');

ciGulp.task('github-ticket:state:open', (args) => [
    'Navigate to github issue:',
    `https://github.com/sebastianperruolo/gulp-ci/issues/${args.featureId}`,
    'Open ticket (??)'
]);
