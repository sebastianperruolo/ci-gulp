// Module to require whole directories
const requireDir = require('require-dir');

requireDir('./tasks', {recurse: false});
requireDir('./actions', {recurse: false});
