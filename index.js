
const gulpLib = require('gulp');
const argv = require('yargs').argv;
const inquirer = require('inquirer');
const sequence = require('run-sequence');
// Provides an easy way to get a listing of your tasks from your gulpfile.
const taskListing = require('gulp-task-listing');

function gulpCi(_gulp) {
    let globals = {}, doc = {
        tasks: {}
    };


    _gulp.task('default', taskListing);

    return {
        action: action,
        task: task
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
                    console.log('building globals ' + taskName);
                    globals = buildGlobals(mappers, done);
                    if (!globals) {
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
        //console.info(`action < ${name}`);
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
                let humanMessages = human(globals);
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

    function buildGlobals(mappers, error) {
        let result = {};

        Object.keys(mappers || {}).forEach(mapperKey => {
            let mapperValue = mappers[mapperKey];
            if (typeof mapperValue === 'string') {
                result[mapperKey] = argv[mapperValue];
                if (!result[mapperKey]) {
                    result.error = new Error(`Parameter --${mapperValue} is missing`);
                }
            } else {
                // function provided
                result[mapperKey] = mapperValue(result);
                if (!result[mapperKey]) {
                    result.error = new Error(`Parameter --${mapperKey} is missing`);
                }
            }
        });

        if (result.error) {
            error(result.error);
            return;
        }
        return result;
    }

    function cliParams(mappers) {
        return Object
            .keys(mappers)
            .map(key => mappers[key])
            .filter(v => typeof v === 'string')
            .join(' ');
    }

    function taskHumanInstructions(taskName) {
        let humanMessages = doc.tasks[taskName](globals);
        if (Array.isArray(humanMessages)) {
            return humanMessages.map(line => `\t${line}`).join('\n');
        }
        return humanMessages;
    }
}

module.exports = gulpCi(gulpLib);