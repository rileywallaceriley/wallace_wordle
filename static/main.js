let secretWord = "";
let currentRow = 0;
let currentGuess = "";
const maxAttempts = 6;

const rows = [];

const qwertyLayout = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Enter","Z","X","C","V","B","N","M","Del"]
];

async function startGame() {
  const mode = document.getElementById("mode").value;
  const type = document.getElementById("type").value;
  const res = await fetch(`/get_word?mode=${mode}&type=${type}`);
  const data = await res.json();
  secretWord = data.word.toUpperCase();

  currentRow = 0;
  currentGuess = "";
  renderBoard();
  buildKeyboard();
}

function renderBoard() {
  const feedback = document.getElementById("feedback");
  feedback.innerHTML = "";
  for (let i = 0; i < maxAttempts; i++) {
    const row = document.createElement("div");
    row.className = "feedback-row";
    rows[i] = [];
    for (let j = 0; j < 5; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      row.appendChild(tile);
      rows[i].push(tile);
    }
    feedback.appendChild(row);
  }
}

function buildKeyboard() {
  const kb = document.getElementById("keyboard");
  kb.innerHTML = "";
  qwertyLayout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "key-row";
    row.forEach(key => {
      const btn = document.createElement("button");
      btn.className = "key";
      if (key === "Enter") btn.classList.add("enter");
      if (key === "Del") btn.classList.add("delete");
      btn.innerText = key;
      btn.onclick = () => handleKeyPress(key);
      rowDiv.appendChild(btn);
    });
    kb.appendChild(rowDiv);
  });
}

function handleKeyPress(key) {
  if (currentRow >= maxAttempts) return;

  if (key === "Enter") {
    if (currentGuess.length === 5) submitGuess();
  } else if (key === "Del") {
    currentGuess = currentGuess.slice(0, -1);
    updateRow();
  } else if (key.length === 1 && currentGuess.length < 5) {
    currentGuess += key;
    updateRow();
  }
}

function updateRow() {
  for (let i = 0; i < 5; i++) {
    rows[currentRow][i].innerText = currentGuess[i] || "";
  }
}

function submitGuess() {
  const guess = currentGuess.toUpperCase();
  for (let i = 0; i < 5; i++) {
    const tile = rows[currentRow][i];
    const letter = guess[i];
    if (letter === secretWord[i]) {
      tile.classList.add("correct");
    } else if (secretWord.includes(letter)) {
      tile.classList.add("present");
    } else {
      tile.classList.add("absent");
    }
  }

  if (guess === secretWord) {
    alert("You got it!");
  } else {
    currentRow++;
    currentGuess = "";
    if (currentRow === maxAttempts) {
      alert(`Out of guesses. Word was ${secretWord}`);
    }
  }
}