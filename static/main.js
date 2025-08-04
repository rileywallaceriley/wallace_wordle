document.addEventListener("DOMContentLoaded", startGame);

let guesses = [];
let currentRow = 0;
let currentCol = 0;
let targetWord = "";
let gameOver = false;

async function startGame() {
  try {
    const res = await fetch("/get_word");
    const data = await res.json();
    targetWord = data.word.toUpperCase();
    drawBoard();
    drawKeyboard();
  } catch (e) {
    alert("Failed to load word.");
  }
}

function drawBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let row = 0; row < 6; row++) {
    const divRow = document.createElement("div");
    divRow.className = "row";
    for (let col = 0; col < 5; col++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.id = `tile-${row}-${col}`;
      tile.textContent = guesses[row][col];
      divRow.appendChild(tile);
    }
    board.appendChild(divRow);
  }
}

function drawKeyboard() {
  const keys = [
    ..."QWERTYUIOP", ..."ASDFGHJKL", "ENTER", ..."ZXCVBNM", "⌫"
  ];
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";
  keys.forEach(k => {
    const btn = document.createElement("button");
    btn.className = "key";
    btn.textContent = k;
    btn.onclick = () => handleKey(k);
    keyboard.appendChild(btn);
  });
}

function handleKey(key) {
  if (gameOver) return;

  if (key === "ENTER") {
    submitGuess();
  } else if (key === "⌫") {
    if (currentCol > 0) {
      currentCol--;
      guesses[currentRow][currentCol] = "";
      updateBoard();
    }
  } else if (/^[A-Z]$/.test(key)) {
    if (currentCol < 5) {
      guesses[currentRow][currentCol] = key;
      currentCol++;
      updateBoard();
    }
  }
}

function updateBoard() {
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 5; c++) {
      const tile = document.getElementById(`tile-${r}-${c}`);
      tile.textContent = guesses[r][c];
    }
  }
}

async function submitGuess() {
  const guess = guesses[currentRow].join("");
  if (guess.length < 5) return;

  const res = await fetch(`/validate_word?word=${guess}`);
  const data = await res.json();
  if (!data.valid) {
    alert("Not a valid word!");
    return;
  }

  const rowTiles = guesses[currentRow];
  const letterCount = {};
  for (let l of targetWord) letterCount[l] = (letterCount[l] || 0) + 1;

  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`tile-${currentRow}-${i}`);
    const keyBtn = [...document.getElementsByClassName("key")]
      .find(k => k.textContent === rowTiles[i]);

    if (rowTiles[i] === targetWord[i]) {
      tile.classList.add("correct");
      keyBtn?.classList.add("used");
      letterCount[rowTiles[i]]--;
    }
  }

  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`tile-${currentRow}-${i}`);
    const keyBtn = [...document.getElementsByClassName("key")]
      .find(k => k.textContent === rowTiles[i]);

    if (!tile.classList.contains("correct")) {
      if (targetWord.includes(rowTiles[i]) && letterCount[rowTiles[i]] > 0) {
        tile.classList.add("present");
        letterCount[rowTiles[i]]--;
      } else {
        tile.classList.add("absent");
      }
      keyBtn?.classList.add("used");
    }
  }

  if (guess === targetWord) {
    gameOver = true;
    alert("🎉 You got it!");
  } else if (currentRow === 5) {
    gameOver = true;
    alert(`Out of guesses! Word was ${targetWord}`);
  } else {
    currentRow++;
    currentCol = 0;
  }
}

function generateShareText() {
  let lines = [];
  for (let r = 0; r <= currentRow; r++) {
    let row = guesses[r];
    let line = '';
    for (let c = 0; c < 5; c++) {
      const tile = document.getElementById(`tile-${r}-${c}`);
      if (tile.classList.contains("correct")) line += "🟩";
      else if (tile.classList.contains("present")) line += "🟨";
      else line += "⬛";
    }
    lines.push(line);
  }
  return `McWallace Wordle\n${lines.join("\n")}`;
}

function shareResult() {
  const text = generateShareText();
  navigator.clipboard.writeText(text).then(() => {
    alert("Result copied to clipboard!");
  });
}

window.onload = startGame;