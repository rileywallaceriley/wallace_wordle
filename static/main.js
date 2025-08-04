document.addEventListener("DOMContentLoaded", startGame);

let guesses = [];
let currentRow = 0;
let currentCol = 0;
let targetWord = "";
let gameOver = false;

async function startGame() {
  const mode = document.getElementById("mode").value;
  const type = document.querySelector('input[name="type"]:checked').value;

  try {
    const res = await fetch(`/get_word?mode=${mode}&type=${type}`);
    const data = await res.json();

    if (!data.word) {
      alert("Failed to load word.");
      return;
    }

    targetWord = data.word.toUpperCase();
    currentRow = 0;
    currentCol = 0;
    gameOver = false;
    guesses = Array.from({ length: 6 }, () => Array(5).fill(""));

    drawBoard();
    drawKeyboard();
  } catch (err) {
    console.error("Error loading word:", err);
    alert("Failed to load word.");
  }
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
      tile.dataset.row = row;
      tile.dataset.col = col;
      rowDiv.appendChild(tile);
    }
    board.appendChild(rowDiv);
  }
}

function drawKeyboard() {
  const keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
  const kb = document.getElementById("keyboard");
  kb.innerHTML = "";
  keys.forEach(key => {
    const btn = document.createElement("button");
    btn.className = "key";
    btn.textContent = key;
    btn.onclick = () => handleKey(key);
    kb.appendChild(btn);
  });

  const enter = document.createElement("button");
  enter.className = "key";
  enter.textContent = "↵";
  enter.onclick = handleEnter;
  kb.appendChild(enter);

  const del = document.createElement("button");
  del.className = "key";
  del.textContent = "⌫";
  del.onclick = handleDelete;
  kb.appendChild(del);
}

function handleKey(letter) {
  if (gameOver || currentCol >= 5) return;
  guesses[currentRow][currentCol] = letter;
  currentCol++;
  drawBoard();
}

function handleDelete() {
  if (currentCol > 0) {
    currentCol--;
    guesses[currentRow][currentCol] = "";
    drawBoard();
  }
}

async function handleEnter() {
  if (gameOver) return;

  const guess = guesses[currentRow].join("");
  if (guess.length < 5) return;

  const res = await fetch(`/validate_word?word=${guess}`);
  const data = await res.json();
  if (!data.valid) {
    alert("Not in word list");
    return;
  }

  const rowTiles = document.querySelectorAll(`.row:nth-child(${currentRow + 1}) .tile`);
  const keyboardButtons = document.querySelectorAll(".key");

  for (let i = 0; i < 5; i++) {
    const letter = guess[i];
    const tile = rowTiles[i];
    if (letter === targetWord[i]) {
      tile.classList.add("correct");
      markKey(letter, "correct");
    } else if (targetWord.includes(letter)) {
      tile.classList.add("present");
      markKey(letter, "present");
    } else {
      tile.classList.add("absent");
      markKey(letter, "used");
    }
  }

  if (guess === targetWord) {
    alert("You got it!");
    gameOver = true;
    return;
  }

  currentRow++;
  currentCol = 0;

  if (currentRow >= 6) {
    alert(`The word was ${targetWord}`);
    gameOver = true;
  }
}

function markKey(letter, status) {
  const kb = document.querySelectorAll(".key");
  kb.forEach(btn => {
    if (btn.textContent === letter) {
      btn.classList.add(status);
    }
  });
}

function shareResult() {
  const lines = guesses
    .slice(0, currentRow + 1)
    .map(row =>
      row
        .map((_, i) => {
          const tile = document.querySelector(`.row:nth-child(${guesses.indexOf(row)+1}) .tile:nth-child(${i+1})`);
          if (tile.classList.contains("correct")) return "🟩";
          if (tile.classList.contains("present")) return "🟨";
          return "⬛";
        })
        .join("")
    );

  const text = `McWallace Wordle\n${lines.join("\n")}`;
  navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
}