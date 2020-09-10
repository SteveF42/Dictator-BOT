const { Client } = require('discord.js')
const Credentials = require('../Credentials.json')
const TicTacToe = require('./Game').Game

const Bot = new Client();
const prefix = '!';
const CHANNEL_ID = '650870669281591355';
var games = {}
var players = {}

var gameKey = -1;
Bot.login(Credentials.BOT_TOKEN);

//helper function that inserts data into dictionaries so games can be played between two people
const InsertGame = function (authorID, channel) {
    if(authorID in players) return channel.send("You're already in a game!");

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

const leaveGame = function(userID,message){
    let gameID = players[userID]
    let game = games[gameID]
    if(userID in players && game.InPlay()){
        try{
            let player1 = game.GetPlayer1()
            let player2 = game.GetPlayer2()

            Bot.users.fetch(player1).then(username1=>{
                Bot.users.fetch(player2).then(username2=>{
                    message.channel.send(`THE MATCH WITH ${username1} AND ${username2} HAS BEEN CANCELLED`)
                });
            });

            delete games[gameID]
            delete players[player1]
            delete players[player2]
        }catch{
            console.log('error')
        }
    }
    else if(userID in players && !game.InPlay()){
        message.channel.send(`${message.author.username} HAS LEFT THE MATCH!`)
        delete players[userID]
        delete games[gameID]
        gameKey--;
    }
}


Bot.on('ready', () => {
    console.log(`${Bot.user.username} has logged in!`);
});

//message event
Bot.on('message', message => {
    if (message.author.bot) return;

    const authorID = message.author.id;

    //checks if a message in the server started with a command
    if (message.content.startsWith(prefix)) {
        //parses the answer
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substr(prefix.length)
            .split(' ');
        console.log(CMD_NAME);

        if (CMD_NAME == "play") {
            InsertGame(authorID, message.channel)
        }
        if(CMD_NAME == "leave"){
            leaveGame(authorID,message)
        }

        //checks if someone requested a game and that game is in play
        if(authorID in players && games[players[authorID]].GameInPlay()){
            let num_choice = parseInt(CMD_NAME)

            //checks for valid input
            if(!isNaN(num_choice)) {
                let temp_game = games[players[authorID]];
                temp_game.MakeMove(authorID,num_choice);
                let board = temp_game.PrintBoard();
                message.channel.send(board);
                
                let potential_winner = temp_game.TestWinner()
                let is_tie = temp_game.TestTie()

                //checks if someone has won 
                if(potential_winner){
                    Bot.users.fetch(potential_winner).then(username=>{
                        message.channel.send(`${username} WINS!`)

                        let player1 = temp_game.GetPlayer1()
                        let player2 = temp_game.GetPlayer2()

                        let gameKey = games[players[player1]]

                        delete games[gameKey]
                        delete players[player1]
                        delete players[player2]
                    }).catch(err=>console.log(err))
                }else if(is_tie){
                    message.channel.send(`YOU GUYS SUCK! THERE'S A TIE`)

                    let player1 = temp_game.GetPlayer1()
                    let player2 = temp_game.GetPlayer2()

                    let gameKey = games[players[player1]]

                    delete games[gameKey]
                    delete players[player1]
                    delete players[player2]
                }
                else{
                    let playerID = temp_game.GetTurn();
                    Bot.users.fetch(playerID).then(username=>{
                        message.channel.send(`${username}, it is your turn!`).catch(err=>console.log(err))
                    });
                }
            }
        }

        //back door in case someone wants to leave the queue
        if(CMD_NAME == 'leave'){
            //clean up the game stuff
        }
    }
})

Bot.on('messageReactionAdd', Reaction => {
    console.log(Reaction.emoji.name)

})