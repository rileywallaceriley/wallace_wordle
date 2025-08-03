let secretWord = "";
let attempts = 0;
const maxAttempts = 6;

async function startGame() {
    const mode = document.getElementById("mode").value;
    const type = document.getElementById("type").value;
    const response = await fetch(`/get_word?mode=${mode}&type=${type}`);
    const data = await response.json();
    secretWord = data.word.toUpperCase();
    attempts = 0;

    const gameDiv = document.getElementById("game");
    gameDiv.innerHTML = `
        <p>Enter a 5-letter word:</p>
        <input type="text" id="guessInput" maxlength="5" />
        <button onclick="submitGuess()">Submit</button>
        <div id="feedback"></div>
    `;
}

function submitGuess() {
    const input = document.getElementById("guessInput");
    const guess = input.value.toUpperCase();
    if (guess.length !== 5) {
        alert("Please enter a 5-letter word.");
        return;
    }

    attempts++;
    const feedback = document.getElementById("feedback");
    const row = document.createElement("div");
    row.className = "feedback-row";

    for (let i = 0; i < 5; i++) {
        const tile = document.createElement("span");
        tile.className = "tile";

        if (guess[i] === secretWord[i]) {
            tile.classList.add("correct");
        } else if (secretWord.includes(guess[i])) {
            tile.classList.add("present");
        } else {
            tile.classList.add("absent");
        }

        tile.innerText = guess[i];
        row.appendChild(tile);
    }

    feedback.appendChild(row);
    input.value = "";

    if (guess === secretWord) {
        alert(`🎉 You guessed it in ${attempts} tries!`);
    } else if (attempts >= maxAttempts) {
        alert(`❌ Out of tries! The word was ${secretWord}`);
    }
}