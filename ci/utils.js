const inquirer = require('inquirer');

module.exports = {
    UserConfigBuilder: UserConfigBuilder
};

function UserConfigBuilder(json) {
    return {
        obj: function (key) {
            return UserConfigBuilder(json[key] || {});
        },
        value: function (k, v) {
            if (!json[k]) {
                console.info(`[UserConfig] Using default value ${k}: ${v}`);
                json[k] = v;
            } else {
                if (v !== json[k]) {
                    console.info(`[UserConfig] Default value (${v}) is overriden by: json[k]`);
                }
            }
        },
        ask: function (k, message) {
            if (!json[k]) {
                inquirer.prompt([{
                    type: 'input',
                    message: message,
                    default: true,
                    name: 'continue'
                }]).then(answer => {
                    if (answer.continue) {
                        json[k] = answer.continue;
                    } else {
                        console.warn('[UserConfig] Check property ${k}!');
                    }
                });
            }
            
            // }
            // console.log('value: ', json);
        }
    }
}






