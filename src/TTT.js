//helper function that inserts data into dictionaries so games can be played between two people
const TicTacToe = require('./Game').Game

const games = {}
const players = {}
let gameKey = -1;

// puts a player in the game que or into an actual game
function insertGame(authorID, channel, bot) {
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

// ends the game if a user is in the players list, if they are in a game it terminates all together
function leaveGame(userID, message, bot) {
    let gameID = players[userID]
    let game = games[gameID]

    // terminates match if its in play
    if (userID in players && game.InPlay()) {
        try {
            let player1 = game.GetPlayer1()
            let player2 = game.GetPlayer2()

            bot.users.fetch(player1).then(username1 => {
                bot.users.fetch(player2).then(username2 => {
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
    // removes user from player queue
    else if (userID in players && !game.InPlay()) {
        message.channel.send(`${message.author.username} HAS LEFT THE MATCH!`)
        delete players[userID]
        delete games[gameID]
        gameKey--;
    }
    else{
        message.reply('YOU\'RE NOT IN A GAME BOZO')
    }

}

function makeMove(Bot) {

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
                    gameKey -= 2;
                }).catch(err => console.log(err))
            } else if (is_tie) { //checks if the game ended in a tie
                message.channel.send(`YOU GUYS SUCK! THERE'S A TIE`)

                let player1 = temp_game.GetPlayer1()
                let player2 = temp_game.GetPlayer2()

                let gameKey = games[players[player1]]

                delete games[gameKey]
                delete players[player1]
                delete players[player2]
                gameKey -= 2;
            }
            else { //
                let playerID = temp_game.GetTurn();
                Bot.users.fetch(playerID).then(username => {
                    message.channel.send(`${username}, it is your turn!`).catch(err => console.log(err))
                });
            }
        }
    }
}
module.exports = { insertGame, leaveGame, makeMove }