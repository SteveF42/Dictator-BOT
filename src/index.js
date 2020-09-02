const { Client } = require('discord.js')
const Credentials = require('../Credentials.json')
const TicTacToe = require('./Game').Game

const Bot = new Client();
const prefix = '!';
const CHANNEL_ID = '750558326101770300';
var games = {}
var players = {}

var gameKey = -1;
Bot.login(Credentials.BOT_TOKEN);

const InsertGame = function (authorID, channel) {
    // if(authorID in players) return channel.send("You're already in a game!");

    let GameID = Math.round(gameKey / 2);
    gameKey++;
    console.log(GameID)

    if (gameKey % 2 == 0) {
        //create a new game here
        let Game = new TicTacToe();
        games[GameID] = Game;
        players[authorID] = GameID;
        Game.SetPlayer1(authorID);
        channel.send('Need one more player...');
    } else {
        //start the game
        games[GameID].SetPlayer2(authorID);
        let board = games[GameID].PrintBoard();
        channel.send(board);
        players[authorID] = GameID;
    }

}


Bot.on('ready', () => {
    console.log(`${Bot.user.username} has logged in!`);
});

Bot.on('message', message => {
    if (message.author.bot) return;

    const authorID = message.author.id;

    if (message.channel.id === '750558326101770300' && message.content.startsWith(prefix)) {
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substr(prefix.length)
            .split(' ');
        console.log(CMD_NAME);

        if (CMD_NAME == "play") {
            InsertGame(authorID, message.channel)
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
                if(potential_winner){
                    Bot.users.fetch(potential_winner).then(username=>{
                        message.channel.send(`${username} WINS!`)
                    })
                }else{
                    let playerID = temp_game.GetTurn();
                    Bot.users.fetch(playerID).then(username=>{
                        message.channel.send(`${username}, it is your turn!`)
                    });
                }
            }
        }
    }
})

Bot.on('messageReactionAdd', Reaction => {
    console.log(Reaction.emoji.name)

})