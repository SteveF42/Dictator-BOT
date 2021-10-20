const file = require("./writeFile")

const COMMANDS = [
    "commands",
    "overthrow",
    "get",
    "remove_user",
    "rotate",
    "dictator",
    "play",
    "leave",
    "deploy" //deploys dictator bot into server reading the 
]


async function deploy(message) {
    const channelID = message.channelID;
    const guildID = message.guildID

    const json = await file.read_file()

    json[guildID] = {
        channelID,
        users: {}
    }

    file.write_file(json)
}

function commands(message) {

    const commands = `
                !commands
                !dictator (join the dictator pool)
                !overthrow (all people need to vote to overthrow)
                !get [dictator,...]
                !remove_user (owner ONLY)
                !rotate (owner ONLY)
                !play (play tic tac toe)
                !leave (leave tic tac toe)
            `

    const embed = new MessageEmbed()
        .setTitle('All Commands')
        .setColor('#2a80f7')
        .setDescription(commands)

    message.channel.send(embed)

}

function dictator(message){
    //get the guildID
    //get user ID
    //if guild already has dictator position then add it to that if not push the guild onto DB
    
    
}

async function checkIfGuildActive() {

}

module.exports = { deploy, commands, dictator}