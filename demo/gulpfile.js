// Module to require whole directories
const requireDir = require('require-dir');
const ciGulp = require('ci-gulp');
const gulp = require('gulp');

requireDir('./tasks', { recurse: false });
requireDir('./actions', { recurse: false });

console.log('gulp file begin');

// gulp.task('default', (done) => {
//     registrar tareas de config
//     console.log('gulp default begin');
    ciGulp.init((userConfig) => {
        console.log('ciGulp init begin');
        userConfig.obj('redmine').ask('apiKey', 'Please go to https://redmine.kache.com.ar/my/account and get your API key');
        userConfig.obj('google').obj('recapcha').ask('publicKey', 'Please go to https://www.google.com/recaptcha/admin#list and get your API key');
        userConfig.obj('google').obj('recapcha').ask('privateKey', 'Please go to https://www.google.com/recaptcha/admin#list and get your API key');
        userConfig.obj('env').value('profile', 'develop');
        console.log('ciGulp init end');
    });
//     console.log('gulp default end');
// });
// console.log('gulp file end');