from .util import path_resolve
from chalice import Response
from http.cookies import SimpleCookie


def authenticate(username, password):
    return username == 'user' and password == 'ritera'


def authorize():
    cookie = SimpleCookie()
    cookie['session'] = 'abcdef'
    return cookie.output(header='', sep='')


def verify_auth(request):
    cookie = SimpleCookie()
    cookie.load(request.headers.get('Cookie', ''))
    if "session" in cookie:
        session = cookie["session"].value
        if validate_session(session):
            return session
    return False


def redirect_to_login():
    return Response(body='', status_code=302,
                    headers={'Location': path_resolve('/login')})


def create_session(device_id):
    cookie = SimpleCookie()
    cookie['session'] = device_id
    cookie['session']['httponly'] = True
    cookie['session']['secure'] = True
    cookie['session']['samesite'] = 'Strict'
    return cookie['session'].OutputString()


def validate_session(session):
    return True
