const rs =require('readline-sync');
const {keyIn} = require("readline-sync");

 rs.keyIn("Push Any Key to Start!",{hideEchoBack:true,mask:""});
/***
 * When both of the battleships have been destroyed the prompt will read, "You have destroyed all battleships. Would you like to play again? Y/N"
 * If "Y" is selected the game starts over. If "N" then the application ends itself.\
 *
 */



class GameBoard {
    constructor(sideLength,shipAmount,ships =[]) {
        this.sideLength = sideLength;
        this.shipAmount = shipAmount;
        this.ships = ships;
    }
    buildGrid(sideLength){
        let board = [];
        for (let i = 0; i <sideLength+1; i++) {
            if(i===0) board.push([...Array(sideLength+1).keys()].map(i => `${i}`));
            else
                 // Starts A=65 but i=0 goes into first case
                board.push([String.fromCharCode(i+64),...Array(sideLength).fill(" ")]);
            }
        return board
    }

    startGame(){
        return this.buildGrid(this.sideLength);
    }
    playGame(playBoard,shipLocations){
        const guessedSpots = [];
        while (this.shipAmount > 0) {
            console.log("----------------------------------------");
            console.log(playBoard);
            let target=rs.prompt({prompt:"Enter a strike location. ie 'A2'\n"});
            console.log(this.checkTarget(target, shipLocations,guessedSpots));
            console.log( `
    Guessed Spots : ${guessedSpots}`);
        }
    }

   checkTarget(target,shipLocations,guessedSpots){
        if (guessedSpots.includes(target.toUpperCase())){return "You have already picked this location! Miss!"}
        guessedSpots.push(target.toUpperCase());

        if (shipLocations.includes(target.toUpperCase())) {
            this.shipAmount--;
            return `Hit. You have sunk a battleship. ${this.shipAmount} ship(s) remaining.`
        }else return  "You have missed!";
    }


}
let playAgain =true;

while(playAgain) {
    const game = new GameBoard(3, 2);
    let playBoard = game.startGame();
    game.ships = addShips(game.shipAmount, playBoard);
    game.playGame(playBoard,game.ships)
    playAgain = rs.keyInYN("You have destroyed all the battleships.\n Would you like to play again?")
}

function addShips(shipAmount,board){
    let ships = [];
    for (let i = 0; i < shipAmount; i++) {
        let randomCol = getRandomIntInclusive(1,board.length-1);
        let randomRow = String.fromCharCode(getRandomIntInclusive(1,board.length-1)+64);
        if(ships.includes(randomRow+randomCol)){ addShips(shipAmount-1,board) }
        else  ships[i] = randomRow+randomCol;
    }
    return ships
}
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}