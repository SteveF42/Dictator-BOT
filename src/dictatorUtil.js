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


async function deploy(message){
    const channelID = message.channelID;
    const guildID = message.guildID

    const json = await file.read_file()
    
    json[guildID] = {
        channelID,
        users:{}
    }
    
    file.write_file(json)
}

async function checkIfGuildActive(){
    
}

module.exports = {deploy}