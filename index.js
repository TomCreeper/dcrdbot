/**
 * @file index.js
 * @author Alejandro Dario Simi
 *
 * Main file for this Discord bot.
 */
'use strict'
//
// Loading configurations
const { env, manifest, tools } = require('./includes/configs');

//
// Loading dependencies.
const Discord = require('discord.io');
const mongoose = require('mongoose');
//
// Checking bot configuration status.
if (env.bot && env.bot.token && manifest.mods && Object.keys(manifest.mods).length > 0) {
    //mongoose.Promise = global.Promise;
    //mongoose.connect(`mongodb://localhost/${dbName}`, {
    //    useMongoClient: true
    //});
    //mongoose.connection.on('error', (err) => {
    //    console.log(`${err.name}: ${err.message}`);
    //});


    //
    // Connection this bot to a Discrod app.
    const bot = new Discord.Client({
        token: env.bot.token,
        autorun: true
    });
    //
    // List of configuration for initializer.
    const piecesParams = {
        bot,
        env,
        manifest,
        tools
    };
    //
    // Loading initializers.
    require('./includes/init-bot')(piecesParams);
    require('./includes/init-mods')(piecesParams);
    require('./includes/triggers')(piecesParams);
    require('./includes/bot-info')(piecesParams);
} else {
    //
    // Handling error.

    if (!manifest.mods || Object.keys(manifest.mods).length < 1) {
        console.error('It seems your bot has no mods.');
    } else {
        console.error('You need to configure a Discord bot token.');
    }
}
