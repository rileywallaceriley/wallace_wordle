let secretWord = "";
let currentGuess = [];
let attempts = 0;
const maxAttempts = 6;
const letterStatuses = {};
const KEY_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "⌫", "⏎"]
];

async function startGame() {
  const mode = document.getElementById("mode").value;
  const type = document.getElementById("type").value;
  const response = await fetch(`/get_word?mode=${mode}&type=${type}`);
  const data = await response.json();
  console.log("Fetched word:", data);
  secretWord = data.word.toUpperCase();
  currentGuess = [];
  attempts = 0;
  Object.keys(letterStatuses).forEach(k => delete letterStatuses[k]);

  document.getElementById("feedback").innerHTML = "";
  buildKeyboard();
}

function buildKeyboard() {
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";
  KEY_LAYOUT.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";
    row.forEach(key => {
      const btn = document.createElement("button");
      btn.className = "key";
      btn.innerText = key;
      btn.onclick = () => handleKey(key);
      if (letterStatuses[key]) btn.classList.add(letterStatuses[key]);
      rowDiv.appendChild(btn);
    });
    keyboard.appendChild(rowDiv);
  });
}

function handleKey(key) {
  if (key === "⌫") {
    currentGuess.pop();
  } else if (key === "⏎") {
    if (currentGuess.length === 5) submitGuess();
    return;
  } else if (currentGuess.length < 5) {
    currentGuess.push(key);
  }
  renderCurrentRow();
}

function renderCurrentRow() {
  const feedback = document.getElementById("feedback");
  const rows = feedback.querySelectorAll(".feedback-row");
  if (rows.length < attempts + 1) {
    const newRow = document.createElement("div");
    newRow.className = "feedback-row";
    feedback.appendChild(newRow);
  }
  const row = feedback.querySelectorAll(".feedback-row")[attempts];
  row.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const tile = document.createElement("span");
    tile.className = "tile";
    tile.innerText = currentGuess[i] || "";
    row.appendChild(tile);
  }
}

function submitGuess() {
  const guess = currentGuess.join("");
  if (guess.length !== 5) return;

  const result = Array(5).fill("absent");
  const secretArr = secretWord.split("");

  for (let i = 0; i < 5; i++) {
    if (guess[i] === secretArr[i]) {
      result[i] = "correct";
      secretArr[i] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    const index = secretArr.indexOf(guess[i]);
    if (index !== -1) {
      result[i] = "present";
      secretArr[index] = null;
    }
  }

  const row = document.getElementById("feedback").querySelectorAll(".feedback-row")[attempts];
  row.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const tile = document.createElement("span");
    tile.className = `tile ${result[i]}`;
    tile.innerText = guess[i];
    row.appendChild(tile);

    const key = guess[i];
    const priority = { correct: 3, present: 2, absent: 1 };
    if (!letterStatuses[key] || priority[result[i]] > priority[letterStatuses[key]]) {
      letterStatuses[key] = result[i];
    }
  }

  attempts++;
  currentGuess = [];
  buildKeyboard();

  if (guess === secretWord) {
    confetti();
    setTimeout(() => alert(`🎉 You got it in ${attempts} tries!`), 150);
  } else if (attempts >= maxAttempts) {
    setTimeout(() => alert(`❌ Out of tries! The word was ${secretWord}`), 150);
  }
}