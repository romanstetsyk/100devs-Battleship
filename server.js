const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const figlet = require('figlet');
const Board = require('./battleship');


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
