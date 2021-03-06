# dcrdbot
Simple discord bot powerd by [izy521/discord.io](https://github.com/izy521/discord.io).

## Installation
First you clone this repository somewhere in your computer:
>git clone https://github.com/daemonraco/dcrdbot.git
>cd dcrdbot

Then you install all it needs:
>npm install

## Configuration
Assuming you already registerd an application in
[Discord](https://discordapp.com/) (if you didn't visit [this
link](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
and for the steps), go to [your
applications](https://discordapp.com/developers/applications/me), selected your
bot, find the section __App Bot User__ and there get your bot's token.
Once you have it, go to your file `configs/environment.json` and configure it in
`bot.token`.

Then, remove some of the ignored mods listed in `ignores.mods` to activate it.
Or you can install a mods from somewhere else or even create your own.

## Running
After you configure all, you just need to run this and it will start:
>npm start

## Multiple configurations
Lets say you want to use this system for two different bots with different
configurations and all.
If that's the case, you can copy your file at `configs/environment.json` to, for
example, `configs/environment.otherbot.json`, use a different bot token on each
file and run two separate commands for each bot, one like this:
>npm start

And another like this:
>ENV=otherbot npm start

Each command will use it's own configuration.

## Mod configuation
Some mods, for example the `imgur` mod, requires you to configure a few things
becuase, by default, it uses wrongs value (on purpose).
To solve this, copy the file at `mods/imgur/config.json` to `configs/imgur.json`
(notice the new file has the same directory name that our mod), and configure your
real data.
By default this bot will try your configuration file before the one inside the mod
itself.

You can also copy it to `configs/imgur.otherbot.json` and it will use that one for
you second bot.

## Tools
This bot provides you with a set of tools that may help with tedious tasks

### Install mods dependencies
If one of your modules requires a `npm` package that is not installed by defualt,
let's say for example `unirest`, you may run this command to automatically read
each mod manifest file, load the list of their dependencies and try to install
them using `npm`:
>npm run install-dependencies

Or just:
>npm run dinstall

### Customize configuration
If the default configuration of one of your mods is not right for your bot and you
want to customize it, you can run this:
>npm run customize-config _&lt;mod-directory-name&gt;_

Or jsut:
>npm run customize _&lt;mod-directory-name&gt;_

This will copy the default configuration file for a mod into `config/` and your
bot will load it as default for that mod.

Also, if you want you customization work for certain environment, you can run
this:
>npm run customize _&lt;mod-directory-name&gt;_ _&lt;environment-suffix&gt;_

## My on mod
_So, you want to create your own mod?_ well, run this command:
>npm run new-mod

Answer all questions and it will create a plugin just for you inside `mods/`.

## Licence
MIT &copy; [Alejandro Dario Simi](http://daemonraco.com)
