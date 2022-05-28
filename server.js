const http = require('http');
const fs = require('fs')
const url = require('url');
const querystring = require('querystring');
const figlet = require('figlet')
// const express = require("express")

// // installed express module and created a constant app in order to host this website publically via glitch on port 3000
// const app = express()
// app.use(express.json())
// app.use(express.static("public"))


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
    this.allCells = [];
    this.blockedCells = [];
    this.ships = [];
  }
  // Sets the list of all cells and available cells. The size of the array is h*w
  initBoardSize() {
    for (let i = 0; i < this.height; i += 1) {
      for (let j = 0; j < this.width; j += 1) {
        this.allCells.push(`${i}-${j}`);
      }
    }
  }

  randomBoard(ArrayOfShipSizes) {
    this.allCells = [];
    this.blockedCells = [];
    this.ships = [];
    this.initBoardSize();
    ArrayOfShipSizes.map(e => this.placeShip(e));
  }

  placeShip(shipSize) {
    // Returns the random number between 0 and n inclusive
    // rand(1) means a random number 0 or 1
    const rand = n => Math.floor(Math.random() * (n + 1));

    // Choose the direction randomly. 1 - horizontal, 0 - vertical
    let direction = rand(1) ? 'horizontal' : 'vertical';
    
    const shipCells = [];
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
      // console.log(this.allCells[k].split('-').map(Number), availLength);
    }
    // Choose ramdomly a cell from available cells to start building a ship
    const startingCell = availCells[rand(availCells.length - 1)];
    const startingCellIndex = this.allCells.indexOf(startingCell);

    for (let i = startingCellIndex; i < startingCellIndex + shipSize * step; i += step) {
      // update cells for current ship
      shipCells.push(this.allCells[i]);
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
    return
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
    console.log('request to api went through');
    if('newBoard' in params) {

      player = new Board(10,10);
      player.randomBoard([5,4,3,3,2]);

      computer = new Board(5, 5);
      computer.randomBoard([5,4,3,3,2]);

      res.writeHead(200, {'Content-Type': 'application/json'});
      const objToJson = {
        height: player.height,
        width: player.width,
        ships: player.ships
      }
      res.end(JSON.stringify(objToJson));
    }


    if('student' in params){
      if(params['student']== 'leon'){
        res.writeHead(200, {'Content-Type': 'application/json'});
        const objToJson = {
          name: "leon",
          status: "Boss Man",
          currentOccupation: "Baller"
        }
        res.end(JSON.stringify(objToJson));
      }//student = leon
      else if(params['student'] != 'leon'){
        res.writeHead(200, {'Content-Type': 'application/json'});
        const objToJson = {
          playerResult: "unknown",
          computerResult: "unkown",
          gameOutcome: "unknown"
        }
        res.end(JSON.stringify(objToJson));
      }//student != leon
    }//student if
  }//else if
  else if (page == '/public/style.css'){
    fs.readFile('public/style.css', function(err, data) {
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
