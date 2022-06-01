const http = require('http');
const fs = require('fs')
const url = require('url');
const querystring = require('querystring');
const figlet = require('figlet')

// After instantiating call .initBoardSize(height, width) method to set the height, width, and allCells properties.
// allCells is an array where each element is 'x-y'. x and y coordinates are separated by dashes. It's easy to parse them later like this using .split('-').
// The main method here is .randomBoard(array). All other are helper methods. I'm not sure how to hide them.
// In .randomBoard(array) the array is the sizes of ships. For example [5,4,3,3] means 1 ship of 5 squares, 1 ship of 4 squares, and 2 ships of 3 squares.
// They are randomly placed in such way that only corners can touch.
// .ships property returns the array of ships (occupied squares)
// .blockedCells property is a helper property, that should be hidden too.. maybe later
class Board {
  constructor(h, w) {
    this.height = h;
    this.width = w;
    // All cells. for a 10x10 board there are 100 cells
    this.allCells = [];
    // All cells with ships in them and cells that surrond the ships
    this.blockedCells = [];
    // Array of all ships, e.g [ ['0-0','0-1','0,2'], ['5-5','5-6'] ]
    this.ships = [];
    // Ships that were not hit. It equals to all ships at the start of the game
    this.availShips = [];
    // Array of cells that your opponent missed.
    this.misses = [];
    // Array of cells that your opponent hit.
    this.hits = [];
    // Availale cells to make moves. Those that are not misses or hits.
    this.untouchedCells = [];
    // if gameLost is true can't make moves
    this.gameLost = false;
  }
  // Sets the list of all cells and available cells. The size of the array is h*w
  // This is a helper method for .randomBoard method
  initBoardSize() {
    for (let i = 0; i < this.height; i += 1) {
      for (let j = 0; j < this.width; j += 1) {
        this.allCells.push(`${i}-${j}`);
        this.untouchedCells.push(`${i}-${j}`);
      }
    }
  }
  // Generates a random board. The array is the sizes of ships.
  // e.g. [5,4,3,3] means 1 ship of 5 squares, 1 ship of 4 squares, and 2 ships of 3 squares.
  randomBoard(ArrayOfShipSizes) {
    this.allCells = [];
    this.blockedCells = [];
    this.ships = [];
    this.availShips = [];
    this.misses = [];
    this.hits = [];
    this.untouchedCells = [];
    this.gameLost = false;

    this.initBoardSize();
    ArrayOfShipSizes.map(e => this.placeShip(e));
  }
  // helper method for .randomBoard. 
  placeShip(shipSize) {
    // Returns the random number between 0 and n inclusive
    // rand(1) means a random number 0 or 1
    const rand = n => Math.floor(Math.random() * (n + 1));

    // Choose the direction randomly. 1 - horizontal, 0 - vertical
    let direction = rand(1) ? 'horizontal' : 'vertical';
    
    const shipCells = [];
    const availShipCells = [];
    let availCells = [];
    let blockedCells = [];

    // for horizontal cells the adjacent cells are 1 away, for vertical - the width of the board
    const step = (direction === 'horizontal') ? 1 : this.width;
    // helper variables to check if subsequent horizontal and vertical elements are available
    const [x,y] = (direction === 'horizontal') ? [0,1] : [1,0]

    // Check if there's enough space to put the ship of size 'shipSize' horizontally
    for (let k = 0; k < this.allCells.length; k += 1) {
      let availLength = 0;
      let diff = 0;
      for (let l = k; l < k + shipSize * step; l += step) {
        let elem = this.allCells[k].split('-').map(Number);
        let nextElem = this.allCells[l]?.split('-').map(Number);
        if (elem[x] === nextElem?.[x] && elem[y] === nextElem?.[y] - diff && !this.blockedCells.includes(this.allCells[l])) {
          availLength += 1;
        } else {
          availLength = 0;
          blockedCells.push(this.allCells[k]);
          break;
        }
        diff += 1;
      }
      if (availLength === shipSize) {
        availCells.push(this.allCells[k]);
      }
    }
    // Choose ramdomly a cell from available cells to start building a ship
    const startingCell = availCells[rand(availCells.length - 1)];
    const startingCellIndex = this.allCells.indexOf(startingCell);

    for (let i = startingCellIndex; i < startingCellIndex + shipSize * step; i += step) {
      // update cells for current ship
      shipCells.push(this.allCells[i]);
      availShipCells.push(this.allCells[i]);
      // Block adjacent cells
      [
        this.allCells[i],
        this.allCells[i - 1]?.split('-')[0] === this.allCells[i]?.split('-')[0] ? this.allCells[i - 1] : '', // check if row of the next elem in the same line
        this.allCells[i + 1]?.split('-')[0] === this.allCells[i]?.split('-')[0] ? this.allCells[i + 1] : '',
        this.allCells[i - this.width],
        this.allCells[i + this.width]
      ].forEach(e => {
        if (!this.blockedCells.includes(e)) {
          this.blockedCells.push(e);
        }
      })
    }
    this.ships.push(shipCells);
    this.availShips.push(availShipCells);
    return
  }
  // Check if the cell clicked by the opponent contains a ship
  // Update availShips, hits, misses, checks if the game is lost
  makeMove(coord) {
    // Can't make move if the game is lost or click twice on the same cell
    if (this.gameLost || this.hits.includes(coord) || this.misses.includes(coord)) {
      return {
        coord: null,
        moveResult: null,
        remCellsNum: this.availShips.reduce((a,e) => a + e.length, 0),
        gameLost: this.gameLost,
      }
    }

    // Check each ship for the coordinate.
    // if found update the hits, if not found update the misses
    let moveResult;
    let sinkedShip = null;
    // label statement to break out of nested loops
    // more info https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label
    loop1:
      for (let ship of this.availShips) {
        for (let i = 0; i < ship.length; i += 1) {
          if (ship[i] === coord) {
            this.hits.push(coord); // add coord to hits
            ship.splice(i, 1); // remove coord from availShips
            // if there are no elements in the array left, then sink is true, otherwise, hit is true
            moveResult = ship.length ? 'hit' : 'sink';
            if (moveResult === 'sink') {
              sinkedShip = this.ships.find(e => e.includes(coord));
            }
            break loop1;
          }
        }
      }

    if (!moveResult) {
      moveResult = 'miss';
      this.misses.push(coord); // add coord to misses
    }

    // remove coord from untouched cells
    this.untouchedCells.splice(this.untouchedCells.indexOf(coord), 1);
    
    // Number of remaining cells needed to hit to lose the game.
    const remCellsNum = this.availShips.reduce((a,e) => a + e.length, 0);
    this.gameLost = !Boolean(remCellsNum);

    return {
      coord,
      moveResult,
      remCellsNum,
      gameLost: this.gameLost,
      sinkedShip,
      as: computer.availShips,
    };

  }
}

// initialize player and computer boards globally so that they are available in all routes.
// maybe we should put it inside createServer function
let player;
let computer;


const server = http.createServer((req, res) => {
  const page = url.parse(req.url).pathname;
  const params = querystring.parse(url.parse(req.url).query);
  console.log(page);
  if (page == '/') {
    fs.readFile('index.html', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  }
  // added a instructions page below to confirm everything is still linking with using express hosting
  else if (page == '/instructions') {
    fs.readFile('instructions.html', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  }
  
  else if (page == '/api') {

    if('newBoard' in params) {

      player = new Board(10,10);
      player.randomBoard([5,4,3,3,2]);

      computer = new Board(10,10);
      computer.randomBoard([5,4,3,3,2]);

      res.writeHead(200, {'Content-Type': 'application/json'});
      const objToJson = {
        height: player.height,
        width: player.width,
        ships: player.ships
      }
      res.end(JSON.stringify(objToJson));
    }

    if('makeMove' in params) {
      // This condition is true if the player clicks on any square on the computer's board.
      // It receives the coordinates 'x-y' as a parameter
      // check if the 'x-y' is in the computer.ships array
      // Send back the response object
      let move = computer.makeMove(params['makeMove']);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(move));
    }

    if('compMove' in params) {
      // Computer makes a move
      // Pick a cell randomly from untouchedCells      
      let randNum = Math.floor(Math.random() * (player.untouchedCells.length + 1));
      let move = player.makeMove(player.untouchedCells[randNum]);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(move));
    }
  }
  else if (page == '/public/style.css'){
    fs.readFile('public/style.css', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/css'});
      res.write(data);
      res.end();
    });
  }else if (page == '/public/main.js'){
    fs.readFile('public/main.js', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.write(data);
      res.end();
    });
  }else{
    figlet('404!!', function(err, data) {
      if (err) {
          console.log('Something went wrong...');
          console.dir(err);
          return;
      }
      res.write(data);
      res.end();
    });
  }
});
// server is hosted and listening on a provided port OR port 3000
server.listen(process.env.PORT || 3000);
