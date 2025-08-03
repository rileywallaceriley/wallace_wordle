async function startGame() {
    const mode = document.getElementById("mode").value;
    const type = document.getElementById("type").value;
    const response = await fetch(`/get_word?mode=${mode}&type=${type}`);
    const data = await response.json();
    const gameDiv = document.getElementById("game");
    gameDiv.innerHTML = `<p>Word to guess (hidden): <span style="color: grey">${data.word}</span></p>`;
}
