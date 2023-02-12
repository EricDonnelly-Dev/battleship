const rs = require("readline-sync");

class Ship {
    constructor(shipSize,shipName, orientation,startPos,endPos,shipLocation) {
        this.shipSize = shipSize;
        this.shipName = shipName;
        this.orientation = orientation; // 1 means vertical 0 means horizontal
        this.startPos = startPos;
        this.endPos = endPos;
        this.shipLocation =shipLocation; // Ship targets
    }
}

class GameBoard {
    constructor(sideLength,shipHealth,ships =[]) {
        this.sideLength = sideLength;
        this.shipHealth = shipHealth;
        this.ships = ships;
    }
    buildGrid(sideLength) {
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
            console.table(playBoard);
        while (this.shipHealth > 0) {
            console.log("----------------------------------------");
            let target=rs.prompt({prompt:"Enter a strike location. ie 'A2'\n"});
            console.log(this.checkTarget(target, shipLocations,guessedSpots));
            console.log( `
    Guessed Spots : ${guessedSpots}`);
        }
    }
    checkTarget(target,shipLocations,guessedSpots){
        if (guessedSpots.includes(target.toUpperCase())){return "You have already picked this location! Miss!"}
        guessedSpots.push(target.toUpperCase());
        if (shipLocations.flat(1).includes(target.toUpperCase())) {
            this.shipHealth--;
            return `Hit. You have hit a battleship. ${this.shipHealth} ship health remaining.`
        } else return  "You have missed!";
    }
}

/** Game Loop **/
rs.keyIn("Push Any Key to Start!",{hideEchoBack:true,mask:""});
let playAgain = true;
while (playAgain) {
    const gameShips = [
        new Ship(5,"carrier",0,undefined ,undefined ,[]),
        new Ship(4,"destroyer",1,undefined ,undefined ,[]),
        new Ship(3,"sub",1,undefined ,undefined ,[]),
        new Ship(3,"light craft",0,undefined ,undefined ,[]),
        new Ship(2,"tugboat",1,undefined ,undefined ,[])
    ];
    const totalShipHealth = gameShips.reduce((acc,ship)=> acc+ ship.shipSize ,0);
    const game = new GameBoard(10,totalShipHealth);
    let playBoard = game.startGame();
    game.ships = addShips(playBoard,gameShips);
    game.playGame(playBoard,game.ships);
    playAgain = rs.keyInYN("You have destroyed all the battleships.\n Would you like to play again?");
}

function checkForOverlaps(startPoint,endPoint,board,ship) {
    let shipSpaceFree;
    if( ship.orientation === 0) {
        for (let i = startPoint[1]; i <= endPoint[1]; i++) {
            board[startPoint[0]][i] !== " " ? shipSpaceFree = false : shipSpaceFree =true;
            if (!shipSpaceFree) return false;
        }
    }
    else {
        for (let i = startPoint[0]; i <= endPoint[0]; i++) {
            board[i][startPoint[1]] !== " " ? shipSpaceFree = false : shipSpaceFree =true;
            if (!shipSpaceFree) return false;
        }
    }
    return shipSpaceFree;
}

function addShipNameToBoard(startPoint,endPoint,board,ship){
    if( ship.orientation === 0) for (let i = startPoint[1]; i <= endPoint[1]; i++) {
        // board[startPoint[0]][i] = ship.shipName;
        ship.shipLocation.push(String.fromCharCode(startPoint[0]+64)+i)
    }
    else for (let i = startPoint[0]; i <= endPoint[0]; i++) {
        // board[i][startPoint[1]] = ship.shipName;
        ship.shipLocation.push(String.fromCharCode(i+64)+startPoint[1])
    }

}
function addShips(board,gameShips){
    let ships =[];

    function selectRandomStart(ship) {
        let randomCol = getRandomIntInclusive(1, board.length - 1);
        let randomRow = getRandomIntInclusive(1, board.length - 1);
        let rowLetter = String.fromCharCode(randomRow + 64);
        ship.startPos = rowLetter + randomCol;
        return {randomCol, randomRow, rowLetter};
    }

    for (const ship of gameShips) {
        let fullShipSpace = true;
        if (ship.orientation === 0) {
           while (fullShipSpace) {
               let {randomCol, randomRow, rowLetter} = selectRandomStart(ship);
               let shipFits = (randomCol+ship.shipSize) < board.length
               shipFits ? ship.endPos = rowLetter+(randomCol+(ship.shipSize-1)): ship.endPos = rowLetter + (randomCol - (ship.shipSize-1) )
                   if (shipFits) {
                       if(checkForOverlaps([randomRow, ship.startPos[1]], [randomRow, ship.endPos[1]], board,ship)) {
                           addShipNameToBoard([randomRow, ship.startPos[1]], [randomRow, ship.endPos[1]], board, ship);
                           fullShipSpace = false;
                       }
                   }
                   else {
                       if (checkForOverlaps([randomRow, ship.endPos[1]], [randomRow, ship.startPos[1]], board,ship)) {
                           addShipNameToBoard([randomRow, ship.endPos[1]], [randomRow, ship.startPos[1]], board, ship); // pass the arguments in backwards because the ship is added right to left instead
                           fullShipSpace =false;
                       }
                   }
           }
            ships.push(ship.shipLocation);
        } else{
            while (fullShipSpace) {
                let {randomCol, randomRow} = selectRandomStart(ship);
                let shipFits = (randomRow+ship.shipSize) < board.length
                shipFits ? ship.endPos = String.fromCharCode((randomRow+(ship.shipSize-1))+64)+randomCol: ship.endPos = String.fromCharCode((randomRow-(ship.shipSize-1))+64)+ randomCol
                    if (shipFits) {
                        if(checkForOverlaps([randomRow, ship.startPos[1]], [randomRow + (ship.shipSize - 1), ship.endPos[1]], board,ship)){
                            addShipNameToBoard([randomRow, ship.startPos[1]], [randomRow + (ship.shipSize - 1), ship.endPos[1]], board, ship);
                            fullShipSpace =false;
                        }
                    } else {
                        if( checkForOverlaps([randomRow + (ship.shipSize - 1), ship.endPos[1]], [randomRow, ship.startPos[1]], board,ship)) {
                            addShipNameToBoard([randomRow + (ship.shipSize - 1), ship.endPos[1]], [randomRow, ship.startPos[1]], board, ship); // pass the arguments in backwards because the ship is added bot to top instead
                            fullShipSpace =false;
                        }
                    }
                }
            ships.push(ship.shipLocation);
            }

    }
    console.log(ships);
   return ships
}
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

