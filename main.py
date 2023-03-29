from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route, Mount
from starlette.staticfiles import StaticFiles
from app.auth import random_token, auth_and_decode
from os import path as os_path
import uvicorn
import async_termux

APP_ROOT = os_path.abspath(os_path.dirname(__file__))

async def api_hello(request):
    await auth_and_decode(request)
    return JSONResponse({'hello': 'world'})

def build_app():
    print(f"token is: {random_token()}")
    app = Starlette(debug=True, routes=[
        Route('/hello', api_hello, methods=["POST"]),
        Mount("/", app=StaticFiles(directory=os_path.join(APP_ROOT, "static"), html=True)),
    ])
    return app

if __name__ == "__main__":
    HOST = "0.0.0.0"
    PORT = 13880
    token = random_token()
    print(f"http://{HOST}:{PORT}#{token}")
    uvicorn.run(
        "main:build_app",
        factory=True,
        host=HOST,
        port=PORT,
        log_level="info",
        # log_level="debug",
        reload=True,
    )