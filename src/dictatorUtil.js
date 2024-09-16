const { MessageEmbed, Permissions } = require('discord.js')
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
    "stepDown",
    "deploy" //deploys dictator bot into server reading the 
]

const DICTATOR_ROLE = "Dictator"


function commands(message) {

    const commands = `
                !deploy   
                !dictator (join the dictator pool)
                !overthrow (all people need to vote to overthrow)
                !rotate (owner ONLY)
                !updateRoll (Change the dictator name)
                !get [dictator,...]
                !remove @user(owner ONLY)
                !play (play tic tac toe)
                !leave (leave tic tac toe)
                !stepDown (step down from the thrown)
            `

    const embed = new MessageEmbed()
        .setTitle('All Commands')
        .setColor('#2a80f7')
        .setDescription(commands)

    message.channel.send(embed)

}

async function deploy(message) {
    const guildID = message.guild.id

    const dbInfo = DB.getData("/")
    if (guildID in dbInfo) {
        message.reply("already deployed in this server")
    } else {
        //when deployed into server, create a new text channel
        const channel = await createDictatorChannel(message.guild);
        const guildDetails = {
            channelID: channel.id,
            dictatorRoll: DICTATOR_ROLE,
            overthrowList: [],
            users: {},
        }
        //create dictator roll if it doesnt exist adds ADMINISTRATOR priveleges
        message.guild.roles.create({
            data: {
                name: DICTATOR_ROLE,
                permissions: ["ADMINISTRATOR"],
                color: 'BLUE'
            }
            //create dictator channel if one does not already exist
        }).then(roll => {
            message.reply("Your server is now in dictator rotation! \nuse !updateRoll to change dictator roll name. Default(Dictator) \nuse !commands to see a list of commands")
            guildDetails.dictatorRoll = roll.id
            dbInfo[guildID] = guildDetails
            DB.push("/", dbInfo)
        }).catch(e => {
            console.log(e)
            message.channel.send('[INTERNAL ERROR] ' + e)
        })
    }
}
function createDictatorChannel(guild) {
    return guild.channels.create('Dictator-Default', {
        type: 'text',
        reason: "no previous channel"
    }).then(channel => {
        channel.send('[DICTATOR CHANNEL CREATED ALL ROTATIONS ALONGSIDE SERVER COMMANDS WILL BE USED HERE]')
        return channel;
    }).catch(e => {
        console.log(['INTERNAL ERROR' + e]);
    })
}

function dictator(message) {
    //get the guildID
    //get user ID
    //if guild already has dictator position then add it to that if not push the guild onto DB
    const guildID = message.guild.id
    const userID = message.author.id
    const username = message.author.username
    try {
        const db = DB.getData(`/${guildID}`)

        if (userID in db.users) {
            message.reply('you\'re already in the dictator pool!')
            return
        }
        db.users[userID] = username
        DB.push(`/${guildID}`, db)
        message.reply("You have been added to dictator pool!")
    } catch (e) {
        console.log(e)
        message.reply("Your server is not in the dictator pool!")
    }

}

//helper function which rotates the dictator
async function rotate(serverID, dbData) {


    const guild = Bot.guilds.cache.get(serverID)
    const memberList = dbData.users
    let channelID = dbData.channelID
    const dictatorID = dbData.dictatorRoll
    let channel = guild.channels.cache.get(channelID);
    const discordRollObj = guild.roles.cache.find(role => role.id === dictatorID)

    //make a function that checks if the channel still has a dictatoor chat
    //if not create a new chat called dictator and change send warning message
    // that the old dictator channel was probably deleted and to not do that lmao
    if (channel === undefined) {
        //create a new channel
        channel = await createDictatorChannel(guild);
        channel.send("previous channel not found. Don't be deleting that shit lmao");
        dbData.channelID = channel.id;
    }


    if (discordRollObj === undefined) {
        channel.send("Server does not have a dictator role chosen")
        console.log("server does not have a dictator role chosen")
        createDictatorRoll(guild)
        return;
    }

    // console.log(channels.find(channel => channel.id === channelID))
    const keys = Object.keys(memberList)
    if (keys.length === 0 || keys.length == 1) {
        channel.send("No other people to rotate with")
        console.log("No other dictators to rotate out with")
        return;
    }


    const potentialDictators = []
    let pastDictators = 0
    try {

        for (id in memberList) {
            // goes through each server to rotate dictators
            // gets members from server that are saved in the db and checks if they have dictator role
            const guildMember = guild.members.cache.get(id)
            const isDictator = guildMember.roles.cache.find(role => role.id === dictatorID)


            if (isDictator) {
                guildMember.roles.remove(discordRollObj)
                pastDictators++
                console.log(`<@${guildMember.id}> has been dethrowned!`)
                channel.send(`<@${guildMember.id}> has been dethrowned!`)
            } else {
                potentialDictators.push(guildMember)
            }
        }
        //after getting all people with dictator roll, remove it and give random persin in dictator pool the roll
        if (pastDictators == 0) {
            //just choses the first person in the database to be dictator if one doesnt exist
            console.log("No existing dictators")
            console.log(`<@${potentialDictators[0].id}> has been crowned!`)
            channel.send(`<@${potentialDictators[0].id}> has been crowned!`)
            potentialDictators[0].roles.add(discordRollObj)
            return
        }

        //picks a random user from potentialDictator list
        let randNum = Math.floor(Math.random() * potentialDictators.length);
        const newDictator = potentialDictators[randNum]
        newDictator.roles.add(discordRollObj)
        console.log(`<@${newDictator.id}> has been crowned!`)
        channel.send(`<@${newDictator.id}> has been crowned!`)
        // when a rotate happens clear the overthrow list
        dbData.overthrowList = []
        DB.push(`/${serverID}`, dbData)
    } catch (err) {
        console.log(err)
        channel.send('[INTERNAL ERROR] ' + err)
    }
}

//rotates dictators for ALL servers in db
function rotateDictator() {
    // console.log(Bot.guilds.cache)

    try {

        getDB('/', (dbData) => {
            for (serverID in dbData) {
                rotate(serverID, dbData[serverID])
            }
        })

    } catch (err) {
        console.log(err)
    }

}

function rotateServer(message) {
    const guildOwner = message.guild.ownerID;
    const sender = message.author.id
    if (guildOwner !== sender) {
        message.reply("Only the server owner can manually rotate!")
        return
    }

    getDB(`/${message.guild.id}`, (db, e) => {
        if (e) {
            message.reply("Your server has not deployed Dictator bot")
            return;
        }
        rotate(message.guild.id, db)
    })
}

function overthrow(message) {
    getDB(`/${message.guild.id}`, (db, e) => {
        console.log(db)
        const authorID = message.author.id
        if (e) {
            message.reply("Server not in dictator pool")
            return
        } else if (!authorID in db.users) {
            message.reply("Type !dictator to be eligable to overthrow")
            return
        }

        if (db.overthrowList.find(usr => usr === message.author.id)) {
            message.reply("You can not vote more than once!")
        } else {
            //pushes user onto the overthrow list
            //if enough users voted then it rotates and empties the list
            //update the list at the end
            db.overthrowList.push(message.author.id)
            const keys = Object.keys(db.users)
            message.reply(`${db.overthrowList.length}/${keys.length - 1} needed to overthrow`)

            if (db.overthrowList.length >= keys.length - 1) {
                rotate(message.guild.id, db)
                db.overthrowList = []
            }
            DB.push(`/${message.guild.id}`, db)
        }

    })
}

function updateRollName(message) {
    const [command, ...other] = message.content.trim().substr(1).split(' ')
    const newName = other.join(' ')
    getDB(`/${message.guild.id}`, (db, e) => {
        if (e) {
            console.log('error', e)
            message.channel.send('[INTERNAL ERROR] ' + e)
            return
        }
        const roll = message.guild.roles.cache.find(role => role.id === db.dictatorRoll)

        if (roll === undefined) {
            message.reply('There is no current dictator roll on this server')
            createDictatorRoll(message.guild)
            return
        }
        roll.edit({
            name: newName
        })

        DB.push(`/${message.guild.id}`, db)
        message.reply(`Dictator roll name updated to: ${newName}`)
    })
}

function removeUser(message) {
    const [command, ...other] = message.content.trim().substr(1).split(' ')
    const userInfo = other.join(' ')
    const userID = userInfo.slice(2, userInfo.length - 1)
    console.log(userID)

    if (message.guild.ownerID !== message.author.id) {
        message.reply("Server owner can only remove users")
        return
    }

    getDB(`/${message.guild.id}`, (db, e) => {
        if (e) {
            console.log(e)
            message.channel.send('[INTERNAL ERROR] ' + e)
            return
        }

        const member = message.guild.members.cache.find(member => member.id === userID)
        // checks if the user exists
        if (member !== undefined) {
            const role = member.roles.cache.find(role => role.id === db.dictatorRoll)
            //if that user has dictator roll rotate
            if (role !== undefined) {
                rotate(message.guild.id, db)
            }

            delete db.users[userID]
            DB.push(`/${message.guild.id}`, db)
        }
    })
}

function getDictaorList(message) {
    const guildID = message.guild.id
    getDB(`/${guildID}`, (db, e) => {
        if (e) return;
        const dictatrList = db.users
        const dictatorNames = Object.values(dictatrList)
        const embed = new MessageEmbed()
            .setTitle('All potential dictators!')
            .setColor('#2a80f7')
        dictatorNames.forEach(i => {
            embed.addField(i, "\u200B")
        })
        message.channel.send(embed)
    })
}

function createDictatorRoll(guild) {
    const guildID = guild.id;

    getDB(`/${guildID}`, (db, e) => {
        if (e) {
            console.log('[INTERNAL ERROR]' + e)
            return
        }
        const channelID = db.channelID
        const channel = guild.channels.cache.get(channelID)

        //creates a new dictator roll if for some reason the original got deleted
        guild.roles.create({
            data: {
                name: DICTATOR_ROLE,
                permissions: ["ADMINISTRATOR"],
                color: 'BLUE'
            }
        }).then(roll => {
            channel.send("New dictator Roll created.")
            console.log("new dictator roll created")
            db.dictatorRoll = roll.id
            DB.push(`/${guildID}`, db)
        }).catch(e => {
            console.log(e)
            channel.send('[INTERNAL ERROR] ' + e)
        })

    })
}

function stepDown(message) {
    const guildID = message.guild.id;
    getDB(`/${guildID}`, (db, e) => {
        if (e) {
            message.reply('[INTERNAL ERROR]' + e);
            return;
        }
        const dictatorID = db.dictatorRoll;
        const authorID = message.author.id;
        const guildMember = message.guild.members.cache.get(authorID);
        const isDictator = guildMember.roles.cache.find(role => role.id === dictatorID);
        if (isDictator) {
            message.reply('You have stepped down from the thrown');
            rotate(guildID, db)
        }
    })
}

module.exports = { deploy, commands, dictator, rotateDictator, updateRollName, rotateServer, overthrow, removeUser, getDictaorList, stepDown }

function getDB(data, cb) {
    let db = undefined;
    try {
        db = DB.getData(data)
    } catch (e) {
        cb(db, e)
        return
    }
    cb(db)
}