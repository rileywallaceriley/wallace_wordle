from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from datetime import date
import random
import hashlib

app = FastAPI()

# Serve static and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Load word lists
def load_words(filename):
    with open(filename, "r") as f:
        return [word.strip().upper() for word in f if len(word.strip()) == 5]

kids_words = load_words("words_kids.txt")
adult_words = load_words("words_adult.txt")
valid_guesses = set(load_words("valid_guesses.txt"))

word_lists = {
    "Kid": kids_words,
    "Adult": adult_words
}

# Serve main game HTML
@app.get("/", response_class=HTMLResponse)
async def serve_game(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Get word (daily or random)
@app.get("/get_word")
async def get_word(mode: str = "Kid", type: str = "Daily"):
    word_list = word_lists.get(mode, kids_words)

    if type == "Daily":
        today_str = date.today().isoformat()
        hash_val = int(hashlib.sha256(today_str.encode()).hexdigest(), 16)
        index = hash_val % len(word_list)
        word = word_list[index]
    else:
        word = random.choice(word_list)

    return {"word": word}

# Validate guessed word
@app.get("/validate_word")
async def validate_word(word: str):
    return {"valid": word.upper() in valid_guesses}