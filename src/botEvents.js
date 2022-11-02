const dictatorCommands = require('./dictatorCommands')
const TTTcommands = require('./TTT')
const Credentials = require('../Credentials.json')
const prefix = '!';
const regex = new RegExp('[0-9]')

Bot.login(Credentials.BOT_TOKEN);
Bot.on('ready', async () => {
    console.log(`${Bot.user.username} has logged in!`);
})

// Bot.on('debug', console.log)
// reads all commands from the bot
Bot.on('message', message => {
    if (message.author.bot) return;

    if (message.content.startsWith(prefix)) {

        const [CMD_NAME, ...other] = message.content
            .toLowerCase()
            .trim()
            .substr(prefix.length)
            .split(' ')
        console.log(CMD_NAME);

        //do something to implement tic tac toe again
        if (CMD_NAME === 'play') TTTcommands.insertGame(message.author.id,message.channel,Bot);
        else if (CMD_NAME === 'leave') TTTcommands.leaveGame(message.author.id,message,Bot);
        else if (regex.test(CMD_NAME)) TTTcommands.makeMove(message.author.id,message.channel,Bot);
        else {
            // executes the dictator commands
            try {
                dictatorCommands.execCommand(CMD_NAME, message);
            } catch (err) {
                console.log(err);
            }
        }
    }
})
