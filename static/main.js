let secretWord = "";
let attempts = 0;
const maxAttempts = 6;
const letterStatuses = {}; // A-Z: 'correct', 'present', 'absent'

async function startGame() {
    const mode = document.getElementById("mode").value;
    const type = document.getElementById("type").value;
    const response = await fetch(`/get_word?mode=${mode}&type=${type}`);
    const data = await response.json();
    secretWord = data.word.toUpperCase();
    attempts = 0;
    for (let ch in letterStatuses) delete letterStatuses[ch];

    const gameDiv = document.getElementById("game");
    gameDiv.innerHTML = `
        <div id="feedback"></div>

        <div id="guess-area" style="margin-top: 20px;">
            <input type="text" id="guessInput" maxlength="5" />
            <button onclick="submitGuess()">Submit</button>
        </div>

        <div id="keyboard" style="margin-top: 20px;"></div>
    `;

    drawKeyboard();
    document.getElementById("guessInput").focus();
}

function drawKeyboard() {
    const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const keyboardDiv = document.getElementById("keyboard");
    keyboardDiv.innerHTML = "";

    for (const ch of keys) {
        const btn = document.createElement("span");
        btn.innerText = ch;
        btn.className = "tile";
        if (letterStatuses[ch] === "correct") btn.classList.add("correct");
        else if (letterStatuses[ch] === "present") btn.classList.add("present");
        else if (letterStatuses[ch] === "absent") btn.classList.add("absent");
        keyboardDiv.appendChild(btn);
    }
}

function submitGuess() {
    const input = document.getElementById("guessInput");
    const guess = input.value.toUpperCase();

    if (guess.length !== 5) {
        alert("Please enter a 5-letter word.");
        return;
    }

    if (attempts >= maxAttempts) return;

    const feedback = document.getElementById("feedback");
    const row = document.createElement("div");
    row.className = "feedback-row";

    const result = Array(5).fill("absent");
    const secretCopy = secretWord.split("");
    const guessChars = guess.split("");

    // First pass: correct letters in correct position
    for (let i = 0; i < 5; i++) {
        if (guess[i] === secretCopy[i]) {
            result[i] = "correct";
            secretCopy[i] = null;
        }
    }

    // Second pass: correct letters in wrong position
    for (let i = 0; i < 5; i++) {
        if (result[i] === "correct") continue;
        const index = secretCopy.indexOf(guess[i]);
        if (index !== -1) {
            result[i] = "present";
            secretCopy[index] = null;
        }
    }

    // Draw row and update keyboard tracking
    for (let i = 0; i < 5; i++) {
        const tile = document.createElement("span");
        tile.className = "tile " + result[i];
        tile.innerText = guess[i];
        row.appendChild(tile);

        const ch = guess[i];
        const rank = { "correct": 3, "present": 2, "absent": 1 };
        if (!letterStatuses[ch] || rank[result[i]] > rank[letterStatuses[ch]]) {
            letterStatuses[ch] = result[i];
        }
    }

    feedback.appendChild(row);
    input.value = "";
    attempts++;
    drawKeyboard();
    input.focus();

    if (guess === secretWord) {
        setTimeout(() => alert(`🎉 You guessed it in ${attempts} tries!`), 100);
    } else if (attempts >= maxAttempts) {
        setTimeout(() => alert(`❌ Out of tries! The word was ${secretWord}`), 100);
    }
}