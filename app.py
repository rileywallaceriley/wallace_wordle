from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import random

app = FastAPI()

# Mount static and template directories
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Load word lists from root directory
def load_words(filename):
    with open(filename, "r") as f:
        return [word.strip().upper() for word in f if len(word.strip()) == 5]

kids_words = load_words("words_kids.txt")
adult_words = load_words("words_adult.txt")
valid_guesses = set(load_words("valid_guesses.txt"))

# Store word lists in memory
word_lists = {
    "Kid": kids_words,
    "Adult": adult_words
}

@app.get("/", response_class=HTMLResponse)
async def serve_game(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/get_word")
async def get_word(mode: str = "Kid", type: str = "Daily"):
    word_list = word_lists.get(mode, kids_words)

    if type == "Daily":
        # Use a fixed daily seed
        today = random.randint(0, 999999)
        random.seed(today)
    else:
        random.seed()  # Use system time for randomness

    return {"word": random.choice(word_list)}

@app.get("/validate_word")
async def validate_word(word: str):
    return {"valid": word.upper() in valid_guesses}