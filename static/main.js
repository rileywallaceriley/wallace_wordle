let word = "";
let currentGuess = "";
let guesses = [];
let maxGuesses = 6;
let gameOver = false;

function startGame() {
  const mode = document.getElementById("modeSelect").value;
  const type = document.getElementById("typeSelect").value;

  fetch(`/get_word?mode=${mode}&type=${type}`)
    .then(res => res.json())
    .then(data => {
      word = data.word.toUpperCase();
      currentGuess = "";
      guesses = [];
      gameOver = false;
      document.getElementById("board").innerHTML = "";
      document.getElementById("endMessage").style.display = "none";
      document.getElementById("shareBtn").style.display = "none";
      document.getElementById("randomBtn").style.display = "none";
      renderBoard();
      renderKeyboard();
    });
}

function startRandom() {
  document.getElementById("typeSelect").value = "Random";
  startGame();
}

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let i = 0; i < maxGuesses; i++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < 5; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      const guess = guesses[i] || "";
      if (guess[j]) {
        tile.textContent = guess[j];
        const status = getTileStatus(guess, j);
        tile.classList.add(status[j]);
      }
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function renderKeyboard() {
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";
  const layout = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM⌫"
  ];
  layout.forEach(row => {
    row.split("").forEach(letter => {
      const key = document.createElement("button");
      key.className = "key";
      key.textContent = letter === "⌫" ? "⌫" : letter;
      key.onclick = () => letter === "⌫" ? handleDelete() : handleKey(letter);
      keyboard.appendChild(key);
    });
  });
}

function handleKey(letter) {
  if (gameOver || currentGuess.length >= 5) return;
  currentGuess += letter;
  updateActiveRow();
}

function handleDelete() {
  if (gameOver || currentGuess.length === 0) return;
  currentGuess = currentGuess.slice(0, -1);
  updateActiveRow();
}

function updateActiveRow() {
  const rows = document.getElementsByClassName("row");
  const row = rows[guesses.length];
  if (!row) return;
  for (let i = 0; i < 5; i++) {
    const tile = row.children[i];
    tile.textContent = currentGuess[i] || "";
    tile.className = "tile";
  }
}

document.getElementById("enterBtn").addEventListener("click", () => {
  if (gameOver || currentGuess.length < 5) return;

  fetch(`/validate_word?word=${currentGuess}`)
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        alert("Invalid word");
        return;
      }

      guesses.push(currentGuess);

      if (currentGuess === word) {
        endGame(true);
      } else if (guesses.length === maxGuesses) {
        endGame(false);
      } else {
        currentGuess = "";
        renderBoard();
      }
    });
});

function endGame(won) {
  gameOver = true;
  renderBoard();
  const msg = won
    ? "🎉 Congratulations, you got today’s word!"
    : `❌ The word was ${word}`;
  document.getElementById("endMessage").textContent = msg;
  document.getElementById("endMessage").style.display = "block";
  document.getElementById("shareBtn").style.display = "inline-block";
  document.getElementById("randomBtn").style.display = "inline-block";
}

function shareResult() {
  let summary = `McWallace Wordle 🟩🟨⬛\n\n`;
  guesses.forEach(g => {
    const status = getTileStatus(g);
    for (let i = 0; i < 5; i++) {
      if (status[i] === "correct") summary += "🟩";
      else if (status[i] === "present") summary += "🟨";
      else summary += "⬛";
    }
    summary += "\n";
  });
  summary += `\nTry it today: https://wallace-wordle.onrender.com`;

  navigator.clipboard.writeText(summary).then(() => {
    alert("Result copied to clipboard!");
  });
}

// NEW version that handles duplicate letters properly
function getTileStatus(guess, index = null) {
  let result = Array(5).fill("absent");
  const wordArr = word.split("");
  const guessArr = guess.split("");
  const letterCount = {};

  // Track letters in target word
  for (let char of wordArr) {
    letterCount[char] = (letterCount[char] || 0) + 1;
  }

  // First pass: exact matches
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === wordArr[i]) {
      result[i] = "correct";
      letterCount[guessArr[i]]--;
    }
  }

  // Second pass: present but not exact
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    if (letterCount[guessArr[i]] > 0) {
      result[i] = "present";
      letterCount[guessArr[i]]--;
    }
  }

  return index !== null ? result[index] : result;
}