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
  // Block the board while callback function runs
  document.querySelector('#computer-board').classList.add('disabled');

  // Event listener is added to the board. The .target property extracts exactly which square was clicked
  let coord = event.target.getAttribute('data-coord');
  console.log(coord);
  // if the table heading is clicked the data parameter is null and there's no need to send a request to server
  if (!coord) {
    document.querySelector('#computer-board').classList.remove('disabled');
    return
  }

  const res = await fetch(`/api?makeMove=${coord}`);
  const data = await res.json()
  console.log(data);

  let computerBoard = document.querySelector('#computer-board');
  let target = computerBoard.querySelector(`[data-coord="${data.coord}"]`);
  console.log(data.moveResult);
  switch(data.moveResult) {
    case 'miss':
      target.classList.add('miss');
      await wait(300); // Slow down the computer move
      compMove(); // Computer's move
      break;
    case 'hit':
      target.classList.add('hit');
      break;
    case 'sink':
      data.sinkedShip.forEach(e => {
        computerBoard.querySelector(`[data-coord="${e}"]`).classList.add('sink');
      })
      break;
    default: // if clicked on table heading or in case of an error
      document.querySelector('#computer-board').classList.remove('disabled');
      return
  }

  document.querySelector('#computer-board').classList.remove('disabled');
  await wait(300);
  if (data.gameLost) alert('You Won!');
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
      default:
        return
    }

    await wait(300);
    if (data.gameLost) alert('You Got Got');

  }
}
