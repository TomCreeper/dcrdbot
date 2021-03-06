/**
 * @file includes/config.js
 * @author Alejandro Dario Simi
 *
 * This initializer holds the logic to load all configuration files available for
 * the current environment.
 */
'use strict'

module.exports = ({ forcedEnv, basicMode }) => {
    //
    // Objects to later export.
    let env = {};
    let manifest = {};
    let tools = {};
    let configInfo = {};
    //
    // Loading dependencies.
    const chalk = require('chalk');
    const fs = require('fs');
    const path = require('path');
    const validate = require('jsonschema').validate;
    const mongoose = require('mongoose');
    //
    // Class to manage and organize all configurations loading.
    class ConfigsManager {
        constructor() {
            //
            // Checking custom or default environment.
            this.envSuffix = forcedEnv ? '.' + forcedEnv : (process.env.ENV ? '.' + process.env.ENV : '');
            //
            // Basic values.
            this.rootDir = path.join(__dirname, '..');
            this.dependencyNames = [];
            //
            // Loading knwon json schemas.
            this.schemas = {};
            const files = fs.readdirSync(path.join(__dirname, 'specs'));
            const filePattern = /(.+)\.schema\.json$/;
            for (let k in files) {
                const mat = files[k].match(filePattern);
                if (mat) {
                    this.schemas[mat[1]] = require(path.join(__dirname, 'specs', files[k]));
                }
            }
        }
        /**
         * @todo doc
         */
        loadDataBase() {
            if (!env.db) {
                return;
            }

            let host = env.db.host;
            if (env.db.port) {
                host += `:${env.db.port}`;
            }

            configInfo.dbError = false;
            mongoose.Promise = global.Promise;
            mongoose.connect(`mongodb://${host}/${env.db.name}`, {
                useMongoClient: true
            }).then(() => {
                tools.mongoose = mongoose;
            }, err => {
                configInfo.dbError = `${err.name}: ${err.message}`;
                tools.mongoose = false;
            });
        }
        /**
         * @todo doc
         */
        loadDependencies() {
            for (let k in this.dependencyNames) {
                const name = this.dependencyNames[k];
                tools[name] = require(name);
            }
        }
        /**
         * @todo doc
         */
        loadEnvironment() {
            //
            // Guessing configuration file path.
            const customConfName = `environment${this.envSuffix}.json`;
            const customConf = path.join(this.rootDir, 'configs', customConfName);
            //
            // Checking existence.
            if (fs.existsSync(customConf)) {
                //
                // Loading configuration for the current environment.
                console.log(`Loading configuration from '${chalk.green(customConfName)}'...`);
                env = require(customConf);
                //
                // Validation its format.
                const error = this.valiateKnownSchema(env, 'environment');
                if (error) {
                    console.error(`Environment configuration file '${chalk.green(customConfName)}' has the wrong structure.\nError: ${chalk.red(error)}`);
                    env = {};
                }
            }
        };
        /**
         * @todo doc
         *
         * @return {*} @todo doc
         */
        loadFullManifest() {
            if (!env.ignores) {
                return;
            }
            //
            // Guessing mods directory.
            const modsDir = path.join(this.rootDir, 'mods');
            //
            // Reading possible mods.
            const dirNames = fs.readdirSync(modsDir);
            //
            // Checking each possible mod.
            let mods = {};
            let error = false;
            for (let k in dirNames) {
                const name = dirNames[k];
                //
                // Ignoring mods.
                if (env.ignores.mods.indexOf(name) >= 0) {
                    continue;
                }
                //
                // Guessing manifest file path.
                const manifestPath = path.join(modsDir, name, 'manifest.json');
                //
                // If it has no manifest it's ignored.
                if (fs.existsSync(manifestPath)) {
                    const manifest = require(manifestPath);
                    //
                    // Validating manifest structure.
                    error = this.valiateKnownSchema(manifest, 'manifest');
                    if (error) {
                        console.error(`Mod '${name}' manifest file has the wrong structure.\nError: ${error}`);
                        break;
                    }
                    //
                    // Loading and autocompleting fields.
                    mods[name] = {};
                    mods[name].name = manifest.name;
                    mods[name].brief = manifest.brief;
                    mods[name].description = manifest.description ? manifest.description : manifest.brief;
                    mods[name].main = manifest.main;
                    mods[name].version = manifest.version;
                    mods[name].triggers = manifest.triggers ? manifest.triggers : false;
                    mods[name].hidden = manifest.hidden ? manifest.hidden : false;
                    //
                    // Configuration and configuration validators.
                    mods[name].config = {};
                    mods[name].configSchema = manifest.configSchema ? manifest.configSchema : false;
                    if (manifest.config) {
                        //
                        // Possibe locations where the right configuration could be.
                        const customConfPath = path.join(__dirname, '..', 'configs', `${name}.json`);
                        const customEnvConfPath = path.join(__dirname, '..', 'configs', `${name}${this.envSuffix}.json`);
                        const defaultConfPath = manifest.config ? path.join(modsDir, name, manifest.config) : false;
                        //
                        // Guessing the right path.
                        //  - custom config + environment suffix
                        //  - custom config
                        //  - default config
                        let finalConfPath = false;
                        if (fs.existsSync(customEnvConfPath)) {
                            finalConfPath = customEnvConfPath;
                        } else if (fs.existsSync(customConfPath)) {
                            finalConfPath = customConfPath;
                        } else if (fs.existsSync(defaultConfPath)) {
                            finalConfPath = defaultConfPath;
                        }
                        //
                        // Loading and validating this mod's configuration.
                        mods[name].config = require(finalConfPath);
                        if (mods[name].configSchema) {
                            error = this.valiateSchema(mods[name].config, require(path.join(modsDir, name, mods[name].configSchema)));
                            if (error) {
                                console.error(`Your configuration for mode '${mods[name].name}' at '${finalConfPath}' has the wrong structure.\nError: ${error}`);
                                break;
                            }
                        }
                    }
                    //
                    // Counting dependencies.
                    if (manifest.dependencies) {
                        for (let k in manifest.dependencies) {
                            this.dependencyNames.push(manifest.dependencies[k]);
                        }
                    }
                }

            }
            //
            // If no error was found the manifest object can be build without
            // problems.
            if (!error) {
                manifest = {
                    mods: mods,
                    dependencies: this.dependencyNames
                };
            }
        };
        loadSocket() {
            if (env.socket) {
                //
                // Extending environment logic with socket loaders.
                require('./socket-manager')({ env });
            }
        }
        /**
         * Main method.
         */
        run() {
            this.loadEnvironment();
            this.loadFullManifest();
            this.loadDependencies();
            this.loadDataBase();

            if (!basicMode) {
                this.loadSocket();
            }
        }
        /**
         * @todo doc
         *
         * @param {*} content @todo doc
         * @param {*} schemaName @todo doc
         * @return {*} @todo doc
         */
        valiateKnownSchema(content, schemaName) {
            let error = `Unknown schema '${schemaName}'`;

            if (this.schemas[schemaName]) {
                error = this.valiateSchema(content, this.schemas[schemaName]);
            }

            return error;
        }
        /**
         * @todo doc
         *
         * @param {*} content @todo doc
         * @param {*} schema @todo doc
         * @return {*} @todo doc
         */
        valiateSchema(content, schema) {
            let error = false;

            const check = validate(content, schema);
            if (check.errors.length > 0) {
                error = check.errors[0].stack;
            }

            return error;
        }
    }
    //
    // Running all.
    const manager = new ConfigsManager();
    manager.run();
    //
    // Exporting loaded configurations.
    return { env, manifest, tools, configInfo };
}
