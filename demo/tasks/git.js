const ciGulp = require('ci-gulp');

ciGulp.task('git:checkout:develop', () => [
    'Run in git bash:',
    'git fetch',
    'git checkout develop',
    'git reset --hard origin/develop'
]);

ciGulp.task('git:branch:feature', (args) => [
    'Run in git bash:',
    `git checkout -b ${args.codeFreezeBranch}`,
    `git push origin ${args.codeFreezeBranch}`
]);
