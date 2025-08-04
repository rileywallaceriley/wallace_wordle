let targetWord = "";
let currentRow = 0;
let currentCol = 0;
let guesses = [];
let gameOver = false;

async function startGame() {
  const mode = document.getElementById("mode").value;
  const type = document.querySelector('input[name="type"]:checked').value;

  const res = await fetch(`/get_word?mode=${mode}&type=${type}`);
  const data = await res.json();

  if (!data.word) {
    alert("Failed to load word.");
    return;
  }

  targetWord = data.word.toUpperCase();
  currentRow = 0;
  currentCol = 0;
  guesses = Array.from({ length: 6 }, () => Array(5).fill(""));
  gameOver = false;

  document.getElementById("shareBtn").style.display = "none";

  drawBoard();
  drawKeyboard();
}

function drawBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  for (let row = 0; row < 6; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";
    for (let col = 0; col < 5; col++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.textContent = guesses[row][col] || "";
      tile.id = `tile-${row}-${col}`;
      rowDiv.appendChild(tile);
    }
    board.appendChild(rowDiv);
  }
}

function drawKeyboard() {
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";

  const keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
  keys.forEach(k => {
    const btn = document.createElement("button");
    btn.textContent = k;
    btn.className = "key";
    btn.onclick = () => handleKey(k);
    keyboard.appendChild(btn);
  });
}

function handleKey(letter) {
  if (gameOver) return;
  if (currentCol < 5) {
    guesses[currentRow][currentCol] = letter;
    currentCol++;
    drawBoard();
  }
}

function submitGuess() {
  if (gameOver || currentCol < 5) return;

  const guess = guesses[currentRow].join("");
  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`tile-${currentRow}-${i}`);
    const letter = guess[i];

    if (letter === targetWord[i]) {
      tile.classList.add("correct");
    } else if (targetWord.includes(letter)) {
      tile.classList.add("present");
    } else {
      tile.classList.add("absent");
    }

    const keyBtn = [...document.getElementsByClassName("key")]
      .find(b => b.textContent === letter);
    if (keyBtn) keyBtn.classList.add("used");
  }

  if (guess === targetWord) {
    gameOver = true;
    document.getElementById("shareBtn").style.display = "inline-block";
    return;
  }

  currentRow++;
  currentCol = 0;

  if (currentRow === 6) {
    gameOver = true;
    alert(`The word was: ${targetWord}`);
    document.getElementById("shareBtn").style.display = "inline-block";
  }
}

function shareResult() {
  let lines = [];
  for (let row = 0; row < currentRow; row++) {
    let line = "";
    for (let col = 0; col < 5; col++) {
      const tile = document.getElementById(`tile-${row}-${col}`);
      if (tile.classList.contains("correct")) line += "🟩";
      else if (tile.classList.contains("present")) line += "🟨";
      else line += "⬛";
    }
    lines.push(line);
  }

  const text = `McWallace Wordle\n${lines.join("\n")}\n\nTry it today: https://wallace-wordle.onrender.com`;

  navigator.clipboard.writeText(text)
    .then(() => alert("Copied to clipboard!"))
    .catch(err => alert("Failed to copy."));
}

document.addEventListener("DOMContentLoaded", startGame);