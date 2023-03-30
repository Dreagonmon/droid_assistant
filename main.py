from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route, Mount
from starlette.staticfiles import StaticFiles
from starlette.exceptions import HTTPException
from app.auth import random_token, auth_and_decode
from os import makedirs, remove, getpid, kill, path as os_path
from signal import SIGINT
from binascii import a2b_base64
from datetime import datetime
from contextlib import asynccontextmanager
from traceback import print_exc
import uvicorn
import asyncio
import async_termux

DEBUG = False
# DEBUG = True
APP_ROOT = os_path.abspath(os_path.dirname(__file__))
TERMUX_SDCARD = "/data/data/com.termux/files/home/storage/shared"
# TERMUX_SDCARD = "./"
FILE_SAVE_PATH = os_path.join(TERMUX_SDCARD, "0TERMUXTEMP0")
DELAY_TO_DELETE = 120 # seconds
HOST = "0.0.0.0"
PORT = 13880

files_to_be_delete = {} # type: dict[str, datetime]
background_tasks = set()
global_app = None

def exit():
    kill(getpid(), SIGINT)

def start_background_task(coro):
    global background_tasks
    task = asyncio.create_task(coro)
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)

async def save_file(filename, b64data):
    if not os_path.exists(TERMUX_SDCARD):
        raise HTTPException(500, "Please run 'termux-setup-storage' first.")
    if not os_path.exists(FILE_SAVE_PATH):
        makedirs(FILE_SAVE_PATH)
    filepath = os_path.join(FILE_SAVE_PATH, filename)
    with open(filepath, "wb") as f:
        f.write(a2b_base64(b64data))
    try:
        await async_termux.media_scan(filepath)
    except:
        print_exc()
    files_to_be_delete[filepath] = datetime.utcnow()

async def api_paste_text(request):
    req = await auth_and_decode(request)
    text = req.get("text", "")
    await async_termux.set_clipboard(text)
    return JSONResponse({ "code": 200, "msg": "ok" })

async def api_paste_image(request):
    req = await auth_and_decode(request)
    img_type = req.get("type", "")
    img_data = req.get("data", "")
    filename = "image" + str(int(datetime.utcnow().timestamp()))
    if (img_type.lower() == "image/png"):
        filename += ".png"
    elif (img_type.lower() == "image/gif"):
        filename += ".gif"
    elif (img_type.lower() == "image/bmp"):
        filename += ".bmp"
    elif (img_type.lower() == "image/webp"):
        filename += ".webp"
    else:
        filename += ".jpg"
    await save_file(filename, img_data)
    return JSONResponse({ "code": 200, "msg": "ok" })

async def long_running_task():
    # exit notify
    async def callback_exit():
        exit()
    try:
        notify_message = f"Visit http://{HOST}:{PORT}#{token}"
        nm = async_termux.NotificationManager()
        await nm.start_callback_server()
        notify = async_termux.Notification(nm.new_nid(), notify_message, "Droid Assistant", ongoing=True)
        notify.set_button1("EXIT", callback_exit)
        await nm.send_notification(notify)
    except:
        print_exc()

    # delete task
    while True:
        deleted = set()
        now = datetime.utcnow()
        for name in files_to_be_delete.keys():
            timeout = (now - files_to_be_delete[name]).seconds
            if timeout >= DELAY_TO_DELETE:
                remove(name)
                deleted.add(name)
        for name in deleted:
            del files_to_be_delete[name]
        await asyncio.sleep(10)

async def on_start():
    start_background_task(long_running_task())

async def on_exit():
    # delete
    deleted = set()
    for name in files_to_be_delete.keys():
        remove(name)
        deleted.add(name)
    for name in deleted:
        del files_to_be_delete[name]

@asynccontextmanager
async def lifespan(app):
    await on_start()
    yield
    await on_exit()

def build_app():
    global global_app
    print(f"token is: {random_token()}")
    app = Starlette(
        debug=DEBUG,
        routes=[
            Route("/api/paste_text", api_paste_text, methods=["POST"]),
            Route("/api/paste_image", api_paste_image, methods=["POST"]),
            Mount("/", app=StaticFiles(directory=os_path.join(APP_ROOT, "static"), html=True)),
        ],
        lifespan=lifespan,
    )
    global_app = app
    return app

if __name__ == "__main__":
    token = random_token()
    print(f"http://{HOST}:{PORT}#{token}")
    uvicorn.run(
        "main:build_app",
        factory=True,
        host=HOST,
        port=PORT,
        log_level="info",
        reload=False,
    )