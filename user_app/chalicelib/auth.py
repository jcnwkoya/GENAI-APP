from .util import path_resolve
from chalice import Response
from http.cookies import SimpleCookie

def authenticate(username, password):
    return username == 'user' and password == 'ritera'

def authorize(request):
    cookie = SimpleCookie()
    cookie.load(request.headers.get('Cookie', ''))
    if "session" in cookie:
        if validate_token(cookie["session"].value):
            return False

    return Response(body='', status_code=302, headers={'Location': path_resolve('/login')}) 

def validate_token(token):
    return token == 'abcdef'
