from hashlib import sha256
from secrets import token_hex
from starlette.requests import Request
from starlette.exceptions import HTTPException
from os import environ
import hmac
import json

ENV_NAME = "_DROID_ASSISTANT_TOKEN_"

def sign(key: str, content: str) -> str:
    byts_key = key.encode("utf-8")
    byts_content = content.encode("utf-8")
    h = hmac.new(byts_key, digestmod=sha256)
    h.update(byts_content)
    return h.hexdigest().upper()

def random_token() -> str:
    return environ.setdefault(ENV_NAME, token_hex(4).upper())

async def auth_and_decode(request: Request) -> dict:
    h_auth = request.headers.get("Auth", "-")
    h_rand = request.headers.get("Rand", "-")
    content = (await request.body()).decode("utf-8")
    local_sign = sign(random_token(), h_rand + content)
    if local_sign != h_auth:
        raise HTTPException(status_code=404)
    return json.loads(content)

