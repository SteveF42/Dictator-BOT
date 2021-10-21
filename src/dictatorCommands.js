// file: contains all of the dictator commands
const dictatorCmds = require("./dictatorUtil")



function execCommand(cmd,message){
    if(cmd === "deploy") dictatorCmds.deploy(message);

    if (cmd === "commands") dictatorCmds.commands(message);

    if (cmd === 'steve') {
        message.channel.send('https://www.youtube.com/watch?v=v7szH6ZWKkg')
    }

    if(cmd === 'dictator') dictatorCmds.dictator(message)

    if(cmd === "rotate") dictatorCmds.rotateDictator(message)
}






module.exports = {execCommand}