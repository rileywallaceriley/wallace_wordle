from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import random
import datetime

app = FastAPI()

# Mount static and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

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

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/get_word")
async def get_word(mode: str = "kids", type: str = "daily"):
    word_list = kids_words if mode == "kids" else adult_words
    word = get_daily_word(word_list) if type == "daily" else random.choice(word_list)
    return JSONResponse({"word": word})