document.querySelector('#clickMe').addEventListener('click', makeReq)

async function makeReq(){
  const userName = document.querySelector("#userName").value;
  const res = await fetch(`/api?student=${userName}`)
  const data = await res.json()

  console.log(data);
  document.querySelector("#playerResult").textContent = data.playerResult
  document.querySelector("#computerResult").textContent = data.computerResult
  document.querySelector("#gameOutcome").textContent = data.gameOutcome
}


// Each board cell is of the form 'i-j'
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
    for (let i = 0; i < this.width; i += 1) {
      for (let j = 0; j < this.height; j += 1) {
        this.allCells.push(`${i}-${j}`);
        // this.availableCells.push(`${i}-${j}`);
      }
    }
  }

  randomBoard(ArrayOfShipSizes) {
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

    if (direction === 'horizontal') {
      // Check if there's enough space to put the ship of size 'shipSize' horizontally
      for (let k = 0; k < this.allCells.length; k += 1) {
        let availLength = 0;
        let diff = 0;
        for (let l = k; l < k + shipSize * step; l += step) {
          let elem = this.allCells[k].split('-').map(Number);
          let nextElem = this.allCells[l]?.split('-').map(Number);
          if (elem[0] === nextElem?.[0] && elem[1] === nextElem?.[1] - diff && !this.blockedCells.includes(this.allCells[l])) {
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

      for (let i = startingCellIndex; i < startingCellIndex + shipSize; i += 1) {
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
    else if (direction === 'vertical') {
      // Check if there's enough space to put the ship of size 'shipSize' horizontally
      for (let k = 0; k < this.allCells.length; k += 1) {
        let availLength = 0;
        let diff = 0;
        for (let l = k; l < k + shipSize * this.width; l += this.width) {
          let elem = this.allCells[k].split('-').map(Number);
          let nextElem = this.allCells[l]?.split('-').map(Number);
          if (elem[1] === nextElem?.[1] && elem[0] === nextElem?.[0] - diff && !this.blockedCells.includes(this.allCells[l])) {
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

      for (let i = startingCellIndex; i < startingCellIndex + shipSize * this.width; i += this.width) {
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

}
let board = new Board(10, 10);
board.initBoardSize();
board.placeShip(5)
console.log(board.ships)
console.log(board.blockedCells);
