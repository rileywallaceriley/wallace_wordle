from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import random
from datetime import date
import hashlib

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

def get_word_list(mode):
    if mode == "kids":
        with open("words_kids.txt") as f:
            return f.read().splitlines()
    else:
        with open("words_adult.txt") as f:
            return f.read().splitlines()

def daily_word(mode):
    word_list = get_word_list(mode)
    today = date.today().isoformat()
    hash_val = int(hashlib.sha256((today + mode).encode()).hexdigest(), 16)
    return word_list[hash_val % len(word_list)]

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/get_word")
async def get_word(mode: str = "kids", type: str = "daily"):
    if type == "random":
        return {"word": random.choice(get_word_list(mode))}
    return {"word": daily_word(mode)}
