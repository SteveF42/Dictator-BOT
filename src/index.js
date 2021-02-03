const { Client, MessageEmbed } = require('discord.js')
const Credentials = require('../Credentials.json')
const TicTacToe = require('./Game').Game
const fs = require('fs')
const user_list = require('./user_list.json')
const path = require('path')

const second = 1000
const min = second * 60
const hour = min * 60
const day = hour * 24

const Bot = new Client({ disableMentions: "none" });
const prefix = '!';
const CHANNEL_ID = '650870669281591355';
const Alfies_server_id = '741527362960883724';
const DICTATOR_NAME = 'Dictator'
const DICTATOR_CHANNEL = 'ticy-toe'
var games = {}
var players = {}
let OVERTHROW_COUNTER = 0;
const OVERTHROW_LIST = [];


const potential_dictators = []
const date = new Date();

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

//every minute it'll check the hour
let rotated_today = false;
setInterval(() => {
    const hour = date.getHours();
    if (hour == 1) {
        console.log("AVAILABLE ROTATION!");
        rotated_today = false;
    }

    if (hour == 23 && rotated_today == false) {
        console.log('rotating dictator')
        rotated_today = true;
        rotate_dictator();
    }

}, min);

// let timer = setInterval(function(){rotate_dictator()},day)

//checks if there are any active dictators
async function check_for_dictator() {
    let guild = Bot.guilds.cache.get(Alfies_server_id)
    //filters through each member and finds each member with a dictator tag
    const members = guild.members.cache.filter(member => member.roles.cache.find(role => role.name == DICTATOR_NAME)).map(member => member.user.id);
    console.log(members)
    if (members.length > 0) return true
    return false;
}

//rotates dictators onces called 
async function rotate_dictator() {
    const guild = Bot.guilds.cache.get(Alfies_server_id)
    let channel = guild.channels.cache.find(channel => channel.name === DICTATOR_CHANNEL);
    if (potential_dictators.length <= 1) {
        channel.send("Hmm, no one else is available.")
        return;
    }

    console.log('Rotating Dictator!');
    let valid_dictator = await check_for_dictator()

    if (valid_dictator) {
        //filters through each member and finds each member with a dictator tag
        const members = guild.members.cache;
        const dictator_role_id = guild.roles.cache.find(role => role.name == DICTATOR_NAME);
        const dictator_list = members
            .filter(member => member.roles.cache
                .find(role => role.name === DICTATOR_NAME))
            .map(member => member.user.id)

        //removes the dictator roll
        let previous_dictator = dictator_list[0]
        members.forEach(dictator => dictator.roles.remove(dictator_role_id));

        //sends a message saying whos getting de throned 
        let channel = guild.channels.cache.find(channel => channel.name === DICTATOR_CHANNEL);
        dictator_list.forEach(id => { channel.send(`<@${id}> HAS BEEN DE-THRONED`) });
        console.log(members.get(previous_dictator).user.username + " Has been de throned")


        //finds user and crowns them the new dictator
        while (true) {
            //gets a random person from the list of potential dictators
            const randInt = Math.floor(Math.random() * potential_dictators.length);
            const new_dictator = potential_dictators[randInt];

            if (new_dictator === previous_dictator) continue;
            const member = guild.members.cache.get(new_dictator)

            member.roles.add(dictator_role_id)
            channel.send(`<@${new_dictator}> IS CROWNED`)
            console.log(members.get(new_dictator).user.username + " Has been CROWNED")

            break;
        }

    } else {
        //if theres no dictator just get a random one 
        const randInt = Math.floor(Math.random() * Math.floor(potential_dictators.length));
        const new_dictator = potential_dictators[randInt];

        let member = Bot.guilds.cache.get(Alfies_server_id).members.cache.get(new_dictator)

        // channel.send(`No Dictators were found, <@${new_dictator} is crowned>`)
        console.log(`No current Dictator found, <@${member.user.username}> is crowned dictator`)
        const dictator_role_id = guild.roles.cache.find(role => role.name == DICTATOR_NAME);

        member.roles.add(dictator_role_id)

    }


}

function read_file() {
    let json = fs.readFileSync(path.join(__dirname, './user_list.json'), 'utf-8', (err, jsonString) => {
        if (err) {
            console.log("error reading file", err)
            return
        }
        return jsonString
    })

    return JSON.parse(json)
}
function write_file(json) {
    let jsonString = JSON.stringify(json)
    fs.writeFile(path.join(__dirname, './user_list.json'), jsonString, (err) => {
        if (err) {
            console.log('error writing to disk')
        }
    })
}


function add_dictator_to_json(name, id) {
    const file_obj = read_file()
    for (x in file_obj) {
        if (x == id || file_obj[x] == id) return;
    }
    file_obj[name] = id

    write_file(file_obj)
}

function remove_dictator_from_json(user_id) {
    const json = read_file()
    const member = Bot.guilds.cache.get(Alfies_server_id).members.cache.find(member => member.user.id === user_id)
    for (x in json) {
        if (x == user_id || json[x] == user_id) {
            delete json[x]
            break;
        }
    }

    console.log(json)
    write_file(json)
}

function is_current_dictator(user_id) {

    const member = Bot.guilds.cache.get(Alfies_server_id).members.cache.get(user_id)
    const member_role = member.roles.cache.find(role => role.name === DICTATOR_NAME)
    if (member_role === undefined) return;
    if (member_role.name == DICTATOR_NAME) {
        rotate_dictator()
    }
}

//helper function that inserts data into dictionaries so games can be played between two people
function InsertGame(authorID, channel) {
    if (authorID in players) return channel.send("You're already in a game!");

    let GameID = Math.round(gameKey / 2);
    gameKey++;

    if (gameKey % 2 == 0) {
        //create a new game here
        let Game = new TicTacToe();
        games[GameID] = Game;
        players[authorID] = GameID;
        Game.SetPlayer1(authorID);
        channel.send('Need one more player...');
    } else {
        //start the game
        channel.send("BEGIN!")
        games[GameID].SetPlayer2(authorID);
        let board = games[GameID].PrintBoard();
        channel.send(board);
        players[authorID] = GameID;
    }

}

function leaveGame(userID, message) {
    let gameID = players[userID]
    let game = games[gameID]
    if (userID in players && game.InPlay()) {
        try {
            let player1 = game.GetPlayer1()
            let player2 = game.GetPlayer2()

            Bot.users.fetch(player1).then(username1 => {
                Bot.users.fetch(player2).then(username2 => {
                    message.channel.send(`THE MATCH WITH ${username1} AND ${username2} HAS BEEN CANCELLED`)
                });
            });

            delete games[gameID]
            delete players[player1]
            delete players[player2]
        } catch {
            console.log('error')
        }
    }
    else if (userID in players && !game.InPlay()) {
        message.channel.send(`${message.author.username} HAS LEFT THE MATCH!`)
        delete players[userID]
        delete games[gameID]
        gameKey--;
    }
}


//message event
Bot.on('message', message => {
    if (message.author.bot) return;

    const authorID = message.author.id;

    //checks if a message in the server started with a command
    if (message.content.startsWith(prefix)) {
        //parses the answer
        const [CMD_NAME, ...other] = message.content
            .trim()
            .substr(prefix.length)
            .split(' ');
        console.log(CMD_NAME);

        if (CMD_NAME == "play") {
            InsertGame(authorID, message.channel)
        }
        if (CMD_NAME == "leave") {
            leaveGame(authorID, message)
        }
        // allows others to join the dictator rotation
        if (CMD_NAME == "dictator") {
            const user_id = message.author.id;
            const username = message.author.username
            if (!potential_dictators.includes(user_id)) {
                potential_dictators.push(user_id);
                add_dictator_to_json(username, user_id)
                const reply_msg = `You now have the chance to become dictator!`;
                message.reply(reply_msg)
                console.log("Potential_dictator list updated, new list: ", potential_dictators)
            } else {
                message.reply("You're already entered")
            }
        }
        //rotates dictators only allows owner as of now
        if (CMD_NAME == "rotate") {
            let server_owner = message.guild.ownerID;
            let user_id = message.author.id
            if (user_id == server_owner) {
                rotate_dictator()
                // timer.refresh()
            } else {
                message.channel.send('Only the server owner can manually rotate Dictators!')
            }
        }
        //removes user from json file
        if (CMD_NAME == "remove_user") {
            let user_to_be_removed = other[0].slice(3, -1)
            let found = potential_dictators.find(x => x === user_to_be_removed)
            if (user_to_be_removed == undefined || !found) {
                message.channel.send("Nope");
                return;
            }

            // if a dictator tries to be malicious by removing their name it'll take away their role
            const potential_dictator_role = message.guild.members.cache.get(user_to_be_removed).roles.cache.find(role => role.name === DICTATOR_NAME)

            if (potential_dictator_role === undefined || message.author.id === user_to_be_removed) {
                //checks if the user is trying to remove themselves from the dictator list 
                if (message.author.id === user_to_be_removed) {
                    console.log('YES IT WOULD ROTATE HERE')
                    // is_current_dictator(message.author.id)
                }

                //removes person from dictator pool and save file
                let index = potential_dictators.indexOf(user_to_be_removed)
                if (index > -1) {
                    potential_dictators.splice(index, 1);
                }
                console.log(`Userkey removed <@${user_to_be_removed}>, potential dictators updated: `, potential_dictators)
                message.channel.send(`<@${user_to_be_removed}> has been removed from the becoming a dictator`)
                remove_dictator_from_json(user_to_be_removed)
            } else {
                message.channel.send("Cannot remove user, they are currently dictator")
            }
        }

        if (CMD_NAME == "get") {
            const second_cmd = other.join(' ')
            console.log(second_cmd)
            if (second_cmd == "dictator pool") {
                const embed_msg = []
                for (let i = 0; i < potential_dictators.length; i++) {
                    const member = message.guild.members.cache.get(potential_dictators[i])
                    let is_dictator = ''
                    if (member.roles.cache.find(role => role.name == DICTATOR_NAME)) {
                        is_dictator = " <---- Dumbass"
                    }
                    embed_msg.push((member.nickname || member.user.username) + is_dictator)
                }

                // sends an embeded message with all the names currently in the dictator pool
                const embed = new MessageEmbed()
                    .setTitle('All Possible Dictators')
                    .setColor('#2a80f7')
                    .setDescription(embed_msg.join('\n\n'))
                message.channel.send(embed)

            }
        }

        //overthrows the dictator
        if (CMD_NAME == "overthrow") {
            const user = message.author.id;

            if (potential_dictators.find(obj => obj === user) && !OVERTHROW_LIST.find(obj=>obj===user)) {
                OVERTHROW_LIST.push(user);
                OVERTHROW_COUNTER++;
                message.channel.send(`${OVERTHROW_COUNTER} OUT OF ${potential_dictators.length} NEEDED TO OVERTHROW THE DICTATOR`);
            }else{
                message.reply("You can't vote more than once!")
            }

            if(OVERTHROW_COUNTER === potential_dictators.length){
                rotate_dictator();
                message.channel.send('THE CURRENT DICTATOR HAS BEEN OVER THROWN!');
                OVERTHROW_COUNTER = 0;
            }
            console.log(OVERTHROW_LIST)
        }

        //checks if someone requested a game and that game is in play
        if (authorID in players && games[players[authorID]].GameInPlay()) {
            let num_choice = parseInt(CMD_NAME)

            //checks for valid input
            if (!isNaN(num_choice)) {
                let temp_game = games[players[authorID]];
                temp_game.MakeMove(authorID, num_choice);
                let board = temp_game.PrintBoard();
                message.channel.send(board);

                let potential_winner = temp_game.TestWinner()
                let is_tie = temp_game.TestTie()

                //checks if someone has won 
                if (potential_winner) {
                    Bot.users.fetch(potential_winner).then(username => {
                        message.channel.send(`${username} WINS!`)

                        let player1 = temp_game.GetPlayer1()
                        let player2 = temp_game.GetPlayer2()

                        let gameKey = games[players[player1]]

                        delete games[gameKey]
                        delete players[player1]
                        delete players[player2]
                    }).catch(err => console.log(err))
                } else if (is_tie) {
                    message.channel.send(`YOU GUYS SUCK! THERE'S A TIE`)

                    let player1 = temp_game.GetPlayer1()
                    let player2 = temp_game.GetPlayer2()

                    let gameKey = games[players[player1]]

                    delete games[gameKey]
                    delete players[player1]
                    delete players[player2]
                }
                else {
                    let playerID = temp_game.GetTurn();
                    Bot.users.fetch(playerID).then(username => {
                        message.channel.send(`${username}, it is your turn!`).catch(err => console.log(err))
                    });
                }
            }
        }

        //back door in case someone wants to leave the queue
        if (CMD_NAME == 'leave') {
            //clean up the game stuff
        }
    }
})


// setTimeout(dictator_rotator(),day_in_ms*2)
Bot.on('messageReactionAdd', Reaction => {
    console.log(Reaction.emoji.name)

})
