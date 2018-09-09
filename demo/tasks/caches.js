const ciGulp = require('ci-gulp');

const caches = { 'tmp': { folder: '/tmp' }, 'log': { folder: '/var/log' } };

ciGulp.loop('caches', caches).task('clean', (args) => [
    'Delete folder',
    `${args.loop.folder}`,
]);

ciGulp.loop('caches', caches).task('init',
    (args) => [
        'Create folder',
        `${args.loop.folder}`,
    ],
    (done, data) => {
        console.warn(`CREATED FOLDER (not really): ${data.folder}`);
        done();
    }
);
