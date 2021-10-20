const { Client, MessageEmbed } = require('discord.js')
const Credentials = require('../Credentials.json')
const dictatorCommands = require('./dictatorCommands')
const { JsonDB } = 'node-json-db';
const { Config } = 'node-json-db/dist/lib/JsonDBConfig'

const second = 1000
const min = second * 60
const hour = min * 60
const day = hour * 24

const Bot = new Client({ disableMentions: "none" });
const db = new JsonDB(new Config("userList.json",true,false,'/'))
const prefix = '!';

const potential_dictators = {}

var gameKey = -1;
Bot.login(Credentials.BOT_TOKEN);

//checks if bot has logged in successfully
Bot.on('ready', async () => {
    console.log(`${Bot.user.username} has logged in!`);
    let json = read_file()

    //reads all names from file and adds it to the potential dictator list
    for (i in json) {
        potential_dictators.push(json[i])
    }
    console.log(potential_dictators)
})

Bot.on('debug', console.log)

//every minute it'll check the hour
let rotated_today = false;
setInterval(() => {
    const date = new Date();
    const hour = date.getHours();

    if (hour == 1) {
        console.log("AVAILABLE ROTATION!");
        rotated_today = false;
    }

    if (hour == 0 && !rotated_today) {
        console.log('rotating dictator')
        rotated_today = true;
        rotate_dictator();
    }

}, min * 30);

// let timer = setInterval(function(){rotate_dictator()},day)


//message event
Bot.on('message', message => {
    if (message.author.bot) return;
    const [CMD_NAME, ...other] = message.content
            .trim()
            .substr(prefix.length)
            .split(' ');
        console.log(CMD_NAME);

    dictatorCommands.execCommand(CMD_NAME,message)

    if (CMD_NAME == "commands") {
        const commands = `
                !commands
                !overthrow (all people need to vote to overthrow)
                !get [dictator,...]
                !remove_user (owner ONLY)
                !rotate (owner ONLY)
                !dictator (join the dictator pool)
                !play (play tic tac toe)
                !leave (leave tic tac toe)
            `

        const embed = new MessageEmbed()
            .setTitle('All Commands')
            .setColor('#2a80f7')
            .setDescription(commands)

        message.channel.send(embed)
    }

    if (CMD_NAME == 'steve') {
        message.channel.send('https://www.youtube.com/watch?v=v7szH6ZWKkg')
    }
})


// setTimeout(dictator_rotator(),day_in_ms*2)
Bot.on('messageReactionAdd', Reaction => {
    console.log(Reaction.emoji.name)

})
