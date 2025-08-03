from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import random
from pathlib import Path
import datetime

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# Load word lists
with open("words/kids.txt") as f:
    kids_words = [line.strip().upper() for line in f if len(line.strip()) == 5]

with open("words/adult.txt") as f:
    adult_words = [line.strip().upper() for line in f if len(line.strip()) == 5]

def get_daily_word(word_list):
    today = datetime.date.today()
    seed = int(today.strftime("%Y%m%d"))
    random.seed(seed)
    return random.choice(word_list)

@app.get("/", response_class=HTMLResponse)
async def root():
    return FileResponse("index.html")

@app.get("/get_word")
async def get_word(mode: str = "kids", type: str = "daily"):
    word_list = kids_words if mode == "kids" else adult_words
    if type == "daily":
        word = get_daily_word(word_list)
    else:
        word = random.choice(word_list)
    return JSONResponse({"word": word})