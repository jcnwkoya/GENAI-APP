from chalice import Blueprint, Response
from urllib.parse import parse_qs
from logging import getLogger

from ..auth import authenticate, create_session
from ..util import path_resolve
from ..template import render_template

logger = getLogger(__name__)

extra_routes = Blueprint(__name__)


@extra_routes.route('/login', methods=['POST'],
                    content_types=['application/x-www-form-urlencoded'])
def post_login():
    req = extra_routes.current_request
    body = parse_qs(req.raw_body.decode('utf-8'))
    username = body.get('username', [''])[0]
    password = body.get('password', [''])[0]

    if authenticate(username, password):
        set_cookie_header_value = create_session(username)
        return Response(
            body='',
            status_code=302,  # 302 Found for redirection
            headers={
                'Location': path_resolve('/'),
                'Set-Cookie': set_cookie_header_value,
            }
        )
    else:
        return Response(body='', status_code=302,
                        headers={
                            'Location': path_resolve('/login')
                            + '?error=Invalid+username+or+password'
                        })


@extra_routes.route('/login', methods=['GET'])
def get_login():
    req = extra_routes.current_request
    error_message = req.query_params.get('error') if req.query_params else None

    html = render_template('login.html', error_message=error_message)

    return Response(body=html, status_code=200,
                    headers={'Content-Type': 'text/html;charset=utf-8'})
