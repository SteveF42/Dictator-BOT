
class Game {
    #player1;
    #player2;
    #gameBoard;
    #turn;
    #inPlay;

    constructor() {
        this.#gameBoard = {
            'TOP_LEFT': 1, 'TOP_MIDDLE': 2, 'TOP_RIGHT': 3,
            'MIDDLE_LEFT': 4, 'MIDDLE': 5, 'MIDDLE_RIGHT': 6,
            'BOTTOM_LEFT': 7, 'BOTTOM_MIDDLE': 8, 'BOTTOM_RIGHT': 9
        }
        this.#turn = true;
        this.#inPlay = false;
    }
    MakeMove(authorID, moveChoice) {
        let key = undefined;
        switch (moveChoice) {
            case 1:
                key = 'TOP_LEFT'
                break;
            case 2:
                key = 'TOP_MIDDLE'
                break;
            case 3:
                key = 'TOP_RIGHT'
                break;
            case 4:
                key = 'MIDDLE_LEFT'
                break;    
            case 5:
                key = 'MIDDLE'
                break;
            case 6:
                key = 'MIDDLE_RIGHT'
                break;
            case 7:
                key = 'BOTTOM_LEFT'
                break;
            case 8:
                key = 'BOTTOM_MIDDLE'
                break;
            case 9:
                key = 'BOTTOM_RIGHT'
                break;
        }
        if(key == undefined)return;

        //player 1
        if (this.#turn && authorID == this.#player1) {
            if(typeof this.#gameBoard[key] == 'number'){
                this.#gameBoard[key]='X';
                this.#turn = !this.#turn
            }
            //player 2
        } else if (!this.#turn && authorID == this.#player2) {
            if(typeof this.#gameBoard[key] == 'number'){
                this.#gameBoard[key]='O';
                this.#turn = !this.#turn
            }
        }
    }
    GetTurn(){
        if(this.#turn) return this.#player1
        else return this.#player2 
    }
    GameInPlay() {
        return this.#inPlay;
    }
    SetPlayer1(player) {
        this.#player1 = player
    }
    SetPlayer2(player) {
        this.#player2 = player
        this.#inPlay = true
    }
    GetPlayer1(){return this.#player1}
    GetPlayer2(){return this.#player2}
    PrintBoard = () => {
        let Board = `#############
#    ${this.#gameBoard.TOP_LEFT}    |    ${this.#gameBoard.TOP_MIDDLE}    |    ${this.#gameBoard.TOP_RIGHT}   # 
#------|------|------#
#    ${this.#gameBoard.MIDDLE_LEFT}   |    ${this.#gameBoard.MIDDLE}   |    ${this.#gameBoard.MIDDLE_RIGHT}    # 
#------|------|------#
#    ${this.#gameBoard.BOTTOM_LEFT}   |    ${this.#gameBoard.BOTTOM_MIDDLE}    |    ${this.#gameBoard.BOTTOM_RIGHT}   #
#############`
        return Board
    }
    #GetWinner = () => {
        let winningMoves = [
            'TOP_LEFT TOP_MIDDLE TOP_RIGHT',
            'MIDDLE_LEFT MIDDLE MIDDLE_RIGHT',
            'BOTTOM_LEFT BOTTOM_MIDDLE BOTTOM_RIGHT',
            'TOP_LEFT MIDDLE_LEFT BOTTOM_LEFT',
            'TOP_MIDDLE MIDDLE BOTTOM_MIDDLE',
            'TOP_RIGHT MIDDLE_RIGHT BOTTOM_RIGHT',
            'TOP_LEFT MIDDLE BOTTOM_RIGHT',
            'TOP_RIGHT MIDDLE BOTTOM_LEFT7'
        ]
        let won = false
        for(let i = 0; i < winningMoves.length;i++){
            let moves = winningMoves[i].split(' ');
            let previousMove = this.#gameBoard[moves[0]];
            won = true;
            for (let i = 0; i < moves.length; i++) {
                if(typeof previousMove == 'number'){
                    won = false;
                    break;
                }

                let currentMove = this.#gameBoard[moves[i]];

                if (previousMove === currentMove){
                    previousMove = currentMove;
                    continue;
                }
                else{
                    won = false;
                    break;
                }
            }
            if (won) return true;
        }
        return false;
    }
    TestTie = function(){
        for(var key in this.#gameBoard){
            if(!isNaN(this.#gameBoard[key])) return false
        }
        return true;
    }

    TestWinner(){
        if(this.#GetWinner())
            return !this.#turn ? this.#player1 : this.#player2;
        // else if(this.#IsBoardOpen) return "TIE";
        else
            return false
    }

}

module.exports = { Game: Game }