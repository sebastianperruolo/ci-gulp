
const gulpLib = require('gulp');
const argv = require('yargs').argv;
const inquirer = require('inquirer');
const sequence = require('run-sequence');
// Provides an easy way to get a listing of your tasks from your gulpfile.
const taskListing = require('gulp-task-listing');

function gulpCi(_gulp) {
    let doc = {
        tasks: {}
    };

    let cliArguments = handleArguments();

    _gulp.task('default', taskListing);

    return {
        action: action,
        task: task,
        args: cliArguments.all,
        loop: loop
    };

    function action(name, actionSteps, mappers) {
        // Define steps tasks
        actionSteps.forEach((actionStepTasks, i) => {
            _defineSequence(
                `${name}:step${i + 1}`,
                actionStepTasks
            );
        });

        // Define action tasks
        _defineSequence(
            name,
            actionSteps.map((_, i) => `${name}:step${i + 1}`)
        );

        // Define document action task
        _gulp.task(`${name}.md`, (done) => {
            let cliArgs = cliParams(mappers);
            let body = `# ${name}\n`;
            body += `> TASK \`gulp ${name} ${cliArgs}\n`;
            body += '\n';
            actionSteps.forEach((actionStepTasks, i) => {
                body += `## Step ${i + 1}\n`;
                body += `> TASK \`gulp ${name}:step${i + 1}\` ${cliArgs}\n`;
                body += '\n';
                actionStepTasks.forEach((task) => {
                    body += `### Task ${task}\n`;
                    body += '\n';
                    body += taskHumanInstructions(task);
                })
                console.info(`\n`);
            });
            console.log(body);
            done();
        })

        function _defineSequence(taskName, taskList) {
            //console.info(`action-define > ${taskName}`);
            _gulp.task(taskName, function (done) {
                if (name === taskName) {
                    let r = cliArguments.build(mappers);
                    if (r) {
                        done(r);
                        return;
                    }
                }

                console.log('run sequence ' + taskName);
                sequence(...taskList, function (error) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        console.log(`${taskName} terminó OK`);
                    }
                    done(error);
                });
            });
            //console.info(`action-define < ${taskName}`);
        }
    }

    


    function task(name, human, optGulpTask) {
        const taskToAssign = (optGulpTask ? optGulpTask : _manualTask());

        //console.log(`task ${name}`);
        _gulp.task(name, taskToAssign);
        doc.tasks[name] = human;

        function _manualTask() {
            return (done) => {
                console.info(`############################################`);
                console.info(`#### TASK [${name}] requires manual intervention`);
                let humanMessages = human(cliArguments.all);
                console.info(`\n`);
                if (Array.isArray(humanMessages)) {
                    humanMessages.forEach(m => console.info(`\t${m}`))
                } else {
                    console.info(`\t${humanMessages}`);
                }
                console.info(`\n`);
                inquirer.prompt([{
                    type: 'confirm',
                    message: 'Please confirm when manual intervertion is done',
                    default: true,
                    name: 'continue'
                }]).then(answer => {
                    if (answer.continue) {
                        console.log('#### Going on');
                        done();
                    } else {
                        done(new Error('STOPPED by user request'));
                    }
                });
            };

        }
    }


    function handleArguments() {
        let args = {};
        return {
            all: function () {
                return args;
            },
            build: buildFromMappers
        };

        function buildFromMappers(mappers) {
            let _args = {}, error;

            Object.keys(mappers || {}).forEach(mapperKey => {
                let mapperValue = mappers[mapperKey];
                if (typeof mapperValue === 'string') {
                    _args[mapperKey] = argv[mapperValue];
                    if (!_args[mapperKey]) {
                        error = new Error(`Parameter --${mapperValue} is missing`);
                    }
                } else {
                    // function provided
                    _args[mapperKey] = mapperValue(_args);
                }
            });
            args = _args;
            return error;
        }
    }

    /**
     * Will create a task for each key
     * @param {string} loopTask - prefix for gulp tasks
     * @param {Object} loopItems - each key will be suffix for gulp task
     */
    function loop(loopGroup, loopItems) {
        return {
            task: function (taskName, human, gulpTask) {
                let subtasks = [];
                Object
                    .keys(loopItems)
                    .forEach(key => {
                        let loopTaskItem = `${loopGroup}:${taskName}:${key}`;
                        let value = loopItems[key];
                        subtasks.push(loopTaskItem);
                        let wrapGulpTask = (gulpTask? (done) => gulpTask(done, value) : undefined);
                        task(loopTaskItem, (args) => human({ ...args, loop: value }), wrapGulpTask);
                    })
                _defineSequence2(
                    `${loopGroup}:${taskName}`,
                    subtasks
                );
            }
        };

        function _defineSequence2(taskName, taskList) {
            _gulp.task(taskName, function (done) {
                sequence(...taskList, function (error) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        console.log(`${taskName} terminó OK`);
                    }
                    done(error);
                });
            });
        }
    }

    function cliParams(mappers) {
        return Object
            .keys(mappers)
            .map(key => mappers[key])
            .filter(v => typeof v === 'string')
            .join(' ');
    }

    function taskHumanInstructions(taskName) {
        let humanMessages = doc.tasks[taskName](cliArguments.all);
        if (Array.isArray(humanMessages)) {
            return humanMessages.map(line => `\t${line}`).join('\n');
        }
        return humanMessages;
    }
}

module.exports = gulpCi(gulpLib);