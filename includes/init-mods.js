'use strict'

const path = require('path');
const chalk = require('chalk');

module.exports = ({ bot, env, manifest, tools }) => {
    const modsPath = path.join(__dirname, 'mods');
    let indeed = [];

    console.log(`Loading plugins:`);
    for (let k in manifest.mods) {
        let mod = manifest.mods[k];
        console.log(`  - '${chalk.green(mod.name)}'...`);
        require(path.join(__dirname, '..', 'mods', k, mod.main))({
            bot,
            env,
            tools,
            pluginConfig: mod.config
        });
    }
}