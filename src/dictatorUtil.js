const { JsonDB } = require("node-json-db");
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

const DICTATOR_ROLE = "Dictator"


async function deploy(message) {
    //when deployed into server, grab guildID and channelID so bot knows what channel to reply to
    console.log(message.channel.id)
    const channelID = message.channel.id;
    const guildID = message.guild.id
    const format = {}
    format[guildID] = {
        channelID:channelID,
        users:{}
    }

    const dbInfo = DB.getData("/")
    if(guildID in dbInfo){
        message.reply("already deployed in this server")
    }else{
        message.reply("Your server is now in dictator rotation!")
        DB.push("/",format)

        //create dictator roll if it doesnt exist
        const roleExists = message.guild.roles.cache.find(role => role.name === DICTATOR_ROLE)
        if(roleExists === undefined){
            message.guild.roles.create(DICTATOR_ROLE)
        }
    }
    
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

function dictator(message) {
    //get the guildID
    //get user ID
    //if guild already has dictator position then add it to that if not push the guild onto DB
    const guildID = message.guild.id
    const userID = message.author.id
    const username = message.author.username
    try{
        const db = DB.getData(`/${guildID}`)
        db.users[username] = userID
        DB.push(`/${guildID}`,db)
        message.reply("You have been added to dictator pool!")
    }catch(e){
        message.reply("Your server is not in the dictator pool!")
    }
    
}

function rotateDictator(message){
    // console.log(Bot.guilds.cache)
    const dbData = DB.getData("/")

    for(serverID in dbData){
        const guild = Bot.guilds.cache.get(serverID)
        const memberList = dbData[serverID].users
        // const dictators = memberList.filter(memberID =>{
        //     const guildMember = guild.members.cache.get(memberID)
        //     return guildMember.roles.cache.find(role => role === DICTATOR_ROLE)
        // })
        const dictators = []
        for(member in memberList){
            const id = memberList[member]
            const guildMember = guild.members.cache.get(id)
            const isDictator = guildMember.roles.cache.find(role => role.name === DICTATOR_ROLE)
             if(isDictator){
                dictators.push(guildMember)
            }
        }
        //after getting all people with dictator roll, remove it and give random persin in dictator pool the roll
    }

}
module.exports = { deploy, commands, dictator, rotateDictator}