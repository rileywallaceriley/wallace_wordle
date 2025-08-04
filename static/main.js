let board = document.getElementById("board");
let keyboard = document.getElementById("keyboard");
let currentRow = 0;
let currentGuess = "";
let guesses = [];
let targetWord = "";
let gameOver = false;

// QWERTY layout
const rows = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  ["Enter", ..."ZXCVBNM".split(""), "Back"]
];

async function startGame() {
  const res = await fetch("/get_word");
  const data = await res.json();
  targetWord = data.word.toUpperCase();
  guesses = Array.from({ length: 6 }, () => Array(5).fill(""));
  drawBoard();
  drawKeyboard();
}

function drawBoard() {
  board.innerHTML = "";
  guesses.forEach((row, rowIndex) => {
    let rowEl = document.createElement("div");
    rowEl.className = "row";
    row.forEach((letter, colIndex) => {
      let tile = document.createElement("div");
      tile.className = "tile";
      tile.textContent = letter;
      tile.id = `tile-${rowIndex}-${colIndex}`;
      rowEl.appendChild(tile);
    });
    board.appendChild(rowEl);
  });
}

function drawKeyboard() {
  keyboard.innerHTML = "";
  rows.forEach(row => {
    let rowEl = document.createElement("div");
    rowEl.className = "key-row";
    row.forEach(key => {
      let btn = document.createElement("button");
      btn.className = "key";
      btn.textContent = key;
      btn.onclick = () => handleKey(key);
      btn.id = `key-${key}`;
      rowEl.appendChild(btn);
    });
    keyboard.appendChild(rowEl);
  });
}

function handleKey(key) {
  if (gameOver) return;

  if (key === "Back") {
    currentGuess = currentGuess.slice(0, -1);
  } else if (key === "Enter") {
    submitGuess();
  } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
    currentGuess += key;
  }
  updateCurrentRow();
}

async function submitGuess() {
  if (currentGuess.length !== 5) return;

  const res = await fetch(`/validate_word?word=${currentGuess}`);
  const data = await res.json();
  if (!data.valid) {
    alert("Not a valid word.");
    return;
  }

  const guess = currentGuess.toUpperCase();
  const row = [];

  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`tile-${currentRow}-${i}`);
    tile.textContent = guess[i];

    if (guess[i] === targetWord[i]) {
      tile.classList.add("correct");
      colorKey(guess[i], "correct");
    } else if (targetWord.includes(guess[i])) {
      tile.classList.add("present");
      colorKey(guess[i], "present");
    } else {
      tile.classList.add("absent");
      colorKey(guess[i], "absent");
    }

    row.push(tile);
  }

  guesses[currentRow] = guess.split("");
  currentRow++;
  currentGuess = "";

  if (guess === targetWord) {
    gameOver = true;
    setTimeout(() => alert("🎉 You got it!"), 300);
  } else if (currentRow === 6) {
    gameOver = true;
    setTimeout(() => alert(`The word was: ${targetWord}`), 300);
  }
}

function updateCurrentRow() {
  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`tile-${currentRow}-${i}`);
    tile.textContent = currentGuess[i] || "";
  }
}

function colorKey(letter, status) {
  const key = document.getElementById(`key-${letter}`);
  if (!key) return;
  key.classList.remove("correct", "present", "absent");
  key.classList.add(status);
}

function generateShareText() {
  let lines = [];
  for (let i = 0; i < currentRow; i++) {
    let rowText = "";
    for (let j = 0; j < 5; j++) {
      const tile = document.getElementById(`tile-${i}-${j}`);
      if (tile.classList.contains("correct")) rowText += "🟩";
      else if (tile.classList.contains("present")) rowText += "🟨";
      else rowText += "⬛";
    }
    lines.push(rowText);
  }
  return `McWallace Wordle\n${lines.join("\n")}`;
}

function shareResult() {
  const text = generateShareText();
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  });
}

startGame();