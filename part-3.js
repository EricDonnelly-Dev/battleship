const rs = require("readline-sync");

class Ship {
    constructor(shipSize,shipName, orientation, startPos =undefined, endPos = undefined , shipLocation =[] ) {
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

        while (this.shipHealth > 0) {
            console.log("----------------------------------------");
            console.table(playBoard);
            let target=rs.prompt({prompt:"Enter a strike location. ie 'A2'\n"});
            console.log(this.checkTarget(target, shipLocations,guessedSpots,playBoard));
            console.log( `
    Guessed Spots : ${guessedSpots}`);
        }
    }
    checkTarget(target,shipLocations,guessedSpots,board){
        if (guessedSpots.includes(target.toUpperCase())){return "You have already picked this location! Miss!"}
        guessedSpots.push(target.toUpperCase());

        function targetToMarker(target ,marker) {
            let rowIndex = target.toUpperCase().charCodeAt(0)-64;
            let col = target[1];
            if(target[2] === "0"){
               col = 10;
            }
            board[rowIndex][col] = marker;
        }

        if (shipLocations.flat(1).includes(target.toUpperCase())) {
            this.shipHealth--;
            targetToMarker(target,"X");
            return `Hit. You have hit a battleship. ${this.shipHealth} ship health remaining.`
        } else {
            targetToMarker(target,"O");
            return  "You have missed!";
        }

    }
}

/** Game Loop **/
rs.keyIn("Push Any Key to Start!",{hideEchoBack:true,mask:""});
let playAgain = true;
while (playAgain) {
    const gameShips =[];
    [
        [5,"carrier"],
        [4,"destroyer"],
        [3,"submarine"],
        [3,"light craft"],
        [2,"tugboat"]
    ].forEach((ship) =>{
        gameShips.push(new Ship(ship[0],ship[1],getRandomIntInclusive(0,1)));
    });
    const totalShipHealth = gameShips.reduce((acc,ship)=> acc+ ship.shipSize ,0);
    const game = new GameBoard(10,totalShipHealth);
    let playBoard = game.startGame();
    game.ships = addShips(playBoard,gameShips);
    game.playGame(playBoard,game.ships);
    playAgain = rs.keyInYN("You have destroyed all the battleships.\n Would you like to play again?");
}

function checkForOverlaps(startPoint,endPoint,ships,ship) {
    let shipSpaceFree = false;
    const params = ship.orientation === 0 ? 1:0;
        for (let i = startPoint[params]; i <= endPoint[params]; i++) {
            const vals = ship.orientation === 0 ? [startPoint[0],i] :[i,startPoint[1]];
            ships.flat(1).includes(String.fromCharCode(vals[0]+64)+vals[1] ,0)
                ? shipSpaceFree = false
                : shipSpaceFree = true;
            if (!shipSpaceFree) return false;
        }
    return shipSpaceFree;
}

function addShipToBoard(startPoint,endPoint,game,ship){
    const params = ship.orientation === 0 ? 1:0;
    for (let i = startPoint[params]; i <= endPoint[params]; i++) {
        const values = ship.orientation === 0
            ? [startPoint[0]+64,i]
            : [i+64,startPoint[1]];
            ship.shipLocation.push(String.fromCharCode(values[0]) + values[1]);
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
        while (fullShipSpace) {
            let {randomCol, randomRow, rowLetter} = selectRandomStart(ship);
            const orientationParam = ship.orientation === 0
                ? randomCol
                : randomRow;
            let shipFits = (orientationParam + ship.shipSize) < board.length ;
            if (ship.orientation === 0) {
                shipFits ? ship.endPos = rowLetter + (randomCol + (ship.shipSize - 1))
                         : ship.endPos = rowLetter + (randomCol - (ship.shipSize - 1))
            } else {
                shipFits ? ship.endPos = String.fromCharCode((randomRow + (ship.shipSize - 1)) + 64) + randomCol
                         : ship.endPos = String.fromCharCode((randomRow - (ship.shipSize - 1)) + 64) + randomCol
            }
            const params = shipFits
                ? [randomRow, ship.startPos[1], randomRow + (ship.shipSize - 1), ship.endPos[1] ]
                : [randomRow + (ship.shipSize - 1),ship.endPos[1],randomRow, ship.startPos[1]];
            if (checkForOverlaps([params[0], params[1]], [params[2], params[3]], ships, ship)) {
                addShipToBoard([params[0], params[1]], [params[2], params[3]], ships, ship);
                fullShipSpace = false;
            }
        }
        ships.push(ship.shipLocation);
    }
    return ships;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

