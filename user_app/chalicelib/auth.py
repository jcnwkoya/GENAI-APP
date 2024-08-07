from .util import path_resolve
from chalice import Response
from http.cookies import SimpleCookie
from urllib.parse import parse_qsl, urlencode


def authenticate(username, password):
    return username == 'user' and password == 'ritera'


def authorize(device_id):
    cookie = SimpleCookie()
    cookie['session'] = device_id
    return cookie.output(header='', sep='')


def verify_auth(request):
    cookie = SimpleCookie()
    cookie.load(request.headers.get('Cookie', ''))
    if "session" in cookie:
        return validate_session(cookie['session'].value)
    return False


def redirect_to_login():
    return Response(body='', status_code=302,
                    headers={'Location': path_resolve('/login')})


def create_session(dict):
    cookie = SimpleCookie()
    cookie['session'] = urlencode(dict)
    cookie['session']['httponly'] = True
    cookie['session']['secure'] = True
    cookie['session']['samesite'] = 'Strict'
    return cookie['session'].OutputString()


def validate_session(value):
    try:
        sess = dict(parse_qsl(value))
        if 'device_id' in sess and 'username' in sess:
            return sess
        return False
    except Exception:
        return False
