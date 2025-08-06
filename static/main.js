let board = [];
let currentRow = 0;
let currentTile = 0;
let word = "";
const maxRows = 6;

const boardEl = document.getElementById("board");
const keyboardEl = document.getElementById("keyboard");
const shareBtn = document.getElementById("shareBtn");
const endMessage = document.getElementById("endMessage");

const keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");

function createBoard() {
  for (let i = 0; i < maxRows; i++) {
    const rowEl = document.createElement("div");
    rowEl.className = "row";
    board[i] = [];
    for (let j = 0; j < 5; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      rowEl.appendChild(tile);
      board[i].push(tile);
    }
    boardEl.appendChild(rowEl);
  }
}

function createKeyboard() {
  keys.forEach((letter) => {
    const key = document.createElement("button");
    key.className = "key";
    key.textContent = letter;
    key.onclick = () => handleKey(letter);
    keyboardEl.appendChild(key);
  });

  const delKey = document.createElement("button");
  delKey.textContent = "⌫";
  delKey.className = "key";
  delKey.onclick = handleBackspace;
  keyboardEl.appendChild(delKey);
}

function handleKey(letter) {
  if (currentTile < 5 && currentRow < maxRows) {
    board[currentRow][currentTile].textContent = letter;
    currentTile++;
  }
}

function handleBackspace() {
  if (currentTile > 0) {
    currentTile--;
    board[currentRow][currentTile].textContent = "";
  }
}

async function handleEnter() {
  if (currentTile < 5 || currentRow >= maxRows) return;

  const guess = board[currentRow].map(t => t.textContent).join("");
  const res = await fetch(`/validate_word?word=${guess}`);
  const data = await res.json();
  if (!data.valid) {
    alert("Invalid word!");
    return;
  }

  const letterCount = {};
  for (let l of word) {
    letterCount[l] = (letterCount[l] || 0) + 1;
  }

  const status = Array(5).fill("absent");

  // First pass: correct
  for (let i = 0; i < 5; i++) {
    if (guess[i] === word[i]) {
      status[i] = "correct";
      letterCount[guess[i]]--;
    }
  }

  // Second pass: present
  for (let i = 0; i < 5; i++) {
    if (status[i] === "absent" && word.includes(guess[i]) && letterCount[guess[i]] > 0) {
      status[i] = "present";
      letterCount[guess[i]]--;
    }
  }

  // Apply coloring
  for (let i = 0; i < 5; i++) {
    board[currentRow][i].classList.add(status[i]);
  }

  if (guess === word || currentRow === maxRows - 1) {
    endMessage.style.display = "block";
    shareBtn.style.display = "inline-block";
  }

  currentRow++;
  currentTile = 0;
}

function shareResult() {
  let result = "McWallace Wordle\n\n";
  for (let i = 0; i < currentRow; i++) {
    const row = board[i];
    for (let j = 0; j < 5; j++) {
      const tile = row[j];
      if (tile.classList.contains("correct")) {
        result += "🟩";
      } else if (tile.classList.contains("present")) {
        result += "🟨";
      } else {
        result += "⬛";
      }
    }
    result += "\n";
  }
  result += `\nTry it today: https://wallace-wordle.onrender.com`;

  navigator.clipboard.writeText(result).then(() => {
    alert("Result copied to clipboard!");
  });
}

async function fetchWord() {
  const res = await fetch("/get_word");
  const data = await res.json();
  word = data.word;
  console.log("Target word:", word);
}

document.getElementById("enterBtn").addEventListener("click", handleEnter);

createBoard();
createKeyboard();
fetchWord();