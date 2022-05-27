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