let solution = "";
let currentRow = 0;
let currentGuess = "";
let isGameOver = false;

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const shareBtn = document.getElementById("shareBtn");
const enterBtn = document.getElementById("enterBtn") || document.createElement("button");

document.addEventListener("DOMContentLoaded", async () => {
  shareBtn.style.display = "none";
  enterBtn.textContent = "Enter";
  enterBtn.id = "enterBtn";
  enterBtn.className = "key";
  document.body.appendChild(enterBtn);

  await startNewGame();

  enterBtn.addEventListener("click", handleEnter);
  shareBtn.addEventListener("click", shareResult);

  document.querySelectorAll("input[name='mode']").forEach(el => el.addEventListener("change", startNewGame));
  document.querySelectorAll("input[name='type']").forEach(el => el.addEventListener("change", startNewGame));
  document.getElementById("newGameBtn").addEventListener("click", startNewGame);
});

async function startNewGame() {
  currentRow = 0;
  currentGuess = "";
  isGameOver = false;
  shareBtn.style.display = "none";

  board.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < 5; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      row.appendChild(tile);
    }
    board.appendChild(row);
  }

  const mode = document.querySelector("input[name='mode']:checked").value;
  const type = document.querySelector("input[name='type']:checked").value;
  const response = await fetch(`/get_word?mode=${mode}&type=${type}`);
  const data = await response.json();
  solution = data.word.toUpperCase();

  createKeyboard();
}

function createKeyboard() {
  keyboard.innerHTML = "";
  const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  rows.forEach(row => {
    row.split("").forEach(letter => {
      const key = document.createElement("button");
      key.textContent = letter;
      key.className = "key";
      key.addEventListener("click", () => handleKey(letter));
      keyboard.appendChild(key);
    });
  });

  const delKey = document.createElement("button");
  delKey.textContent = "Del";
  delKey.className = "key";
  delKey.addEventListener("click", handleDelete);
  keyboard.appendChild(delKey);
}

function handleKey(letter) {
  if (isGameOver || currentGuess.length >= 5) return;
  currentGuess += letter;
  updateBoard();
}

function handleDelete() {
  if (isGameOver || currentGuess.length === 0) return;
  currentGuess = currentGuess.slice(0, -1);
  updateBoard();
}

async function handleEnter() {
  if (isGameOver || currentGuess.length !== 5) return;

  const response = await fetch(`/validate_word?word=${currentGuess}`);
  const data = await response.json();
  if (!data.valid) {
    alert("Not a valid word");
    return;
  }

  const result = evaluateGuess(currentGuess, solution);
  const row = board.children[currentRow].children;
  result.forEach((status, i) => {
    row[i].classList.add(status);
    const key = [...keyboard.children].find(k => k.textContent === currentGuess[i]);
    if (key) key.classList.add("used");
  });

  if (currentGuess === solution) {
    isGameOver = true;
    shareBtn.style.display = "inline-block";
  } else if (++currentRow === 6) {
    isGameOver = true;
    alert(`The word was ${solution}`);
    shareBtn.style.display = "inline-block";
  }

  currentGuess = "";
}

function updateBoard() {
  const row = board.children[currentRow];
  for (let i = 0; i < 5; i++) {
    row.children[i].textContent = currentGuess[i] || "";
  }
}

function evaluateGuess(guess, solution) {
  const result = Array(5).fill("absent");
  const solutionArr = solution.split("");
  const guessArr = guess.split("");

  // First pass: correct letters
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === solutionArr[i]) {
      result[i] = "correct";
      solutionArr[i] = null;
      guessArr[i] = null;
    }
  }

  // Second pass: present letters
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] && solutionArr.includes(guessArr[i])) {
      result[i] = "present";
      solutionArr[solutionArr.indexOf(guessArr[i])] = null;
    }
  }

  return result;
}

function shareResult() {
  let emojiGrid = "";
  for (let i = 0; i < currentRow; i++) {
    const row = board.children[i].children;
    for (let j = 0; j < 5; j++) {
      if (row[j].classList.contains("correct")) emojiGrid += "🟩";
      else if (row[j].classList.contains("present")) emojiGrid += "🟨";
      else emojiGrid += "⬛";
    }
    emojiGrid += "\n";
  }

  const message = `McWallace Wordle\n\n${emojiGrid}\nTry it today: https://wallace-wordle.onrender.com`;

  navigator.clipboard.writeText(message).then(() => {
    alert("Copied to clipboard!");
  });
}