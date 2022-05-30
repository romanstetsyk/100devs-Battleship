// document.querySelector('#clickMe').addEventListener('click', makeReq)

// async function makeReq(){
//   const userName = document.querySelector("#userName").value;
//   const res = await fetch(`/api?student=${userName}`)
//   const data = await res.json()

//   console.log(data);
//   document.querySelector("#playerResult").textContent = data.playerResult
//   document.querySelector("#computerResult").textContent = data.computerResult
//   document.querySelector("#gameOutcome").textContent = data.gameOutcome
// }

// A function to set the delay. ref: https://stackoverflow.com/a/51200649/14469997
const wait = delay => new Promise(resolve => setTimeout(resolve, delay));


// This function creates a board that looks the same as Mili did.
// It was easier to create a board in JS than to target each square with the ship in it separately.
function createBoard(parentElement, height, width, shipCoords = null) {
  // Heading of the board 
  let heading = document.createElement('section');
  heading.setAttribute('class', 'column');
  let head = document.createElement('div');
  heading.appendChild(head);
  for (let i = 0; i < height; i += 1) {
    let div = document.createElement('div');
    div.textContent = i + 1;
    heading.appendChild(div);
  }
  // replace existing player's board by new one
  parentElement.innerHTML = '';
  parentElement.appendChild(heading);
  // create all board cells
  for (let i = 0; i < Number(height); i += 1) {
    let row = document.createElement('section');
    row.setAttribute('class', 'column');
    parentElement.appendChild(row);
    let head = document.createElement('div');
    head.textContent = String.fromCharCode(65 + i); // 65 is a code for capital A
    row.appendChild(head);
    for (let j = 0; j < width; j += 1) {
      let div = document.createElement('div');
      div.setAttribute('data-coord', `${i}-${j}`);
      // if ship coordinates provided, it changes the their class
      if (shipCoords?.flat().includes(`${i}-${j}`)) {
        div.setAttribute('class', 'my-ship');
      }
      row.appendChild(div);
    }
  }
}


document.querySelector('#new-board').addEventListener('click', randomize)

async function randomize() {
  // Sends the request with newBoard query parameter. Expected response is a JSON {height:x, width:y}
  const res = await fetch(`/api?newBoard=${true}`)
  const data = await res.json()
  console.log(data);

  let playerBoard = document.querySelector('#player-board');
  let computerBoard = document.querySelector('#computer-board');

  createBoard(playerBoard, +data.height, +data.width, data.ships) // players board show ships
  createBoard(computerBoard, +data.height, +data.width)
}



document.querySelector('#computer-board').addEventListener('click', makeMove)

// Event is a click event.
async function makeMove(event) {
  // Event listener is added to the board. The .target property extracts exactly which square was clicked
  let coord = event.target.getAttribute('data-coord');
  console.log(coord);
  // if the table heading is clicked the data parameter is null and there's no need to send a request to server
  if (!coord) return

  const res = await fetch(`/api?makeMove=${coord}`);
  const data = await res.json()
  console.log(data);

  let computerBoard = document.querySelector('#computer-board');
  let target = computerBoard.querySelector(`[data-coord="${data.coord}"]`);
  switch(data.moveResult) {
    case 'miss':
      target.classList.add('miss');
      await wait(500); // Slow down the computer move
      compMove();
      break;
    case 'hit':
      target.classList.add('hit');
      break;
    case 'sink':
      data.sinkedShip.forEach(e => {
        computerBoard.querySelector(`[data-coord="${e}"]`).classList.add('sink');
      })
      break;
    default: // in case an error occurs
      return
  }
}

async function compMove() {

  let playerBoard = document.querySelector('#player-board');
  
  // make move until the first miss
  while(true) {
    const res = await fetch(`/api?compMove=${true}`);
    const data = await res.json()
    console.log(data);

    console.log(data.coord);

    let target = playerBoard.querySelector(`[data-coord="${data.coord}"]`);

    switch(data.moveResult) {
      case 'miss':
        target.classList.add('miss');
        return;
      case 'hit':
        target.classList.add('hit');
        break;
      case 'sink':
        data.sinkedShip.forEach(e => {
          playerBoard.querySelector(`[data-coord="${e}"]`).classList.add('sink');
        })
        break;
      default: // in case an error occurs
        return
    }

    await wait(500);

  }
}
