from chalice import Blueprint, Response
from urllib.parse import parse_qs
from logging import getLogger

from ..auth import clear_session, create_session
from ..repositories.device_data import first_device_data_item
from ..util import path_resolve
from ..template import render_template

logger = getLogger(__name__)

extra_routes = Blueprint(__name__)


@extra_routes.route('/login', methods=['POST'],
                    content_types=['application/x-www-form-urlencoded'])
def post_login():
    req = extra_routes.current_request
    body = parse_qs(req.raw_body.decode('utf-8'))
    device_id = body.get('device_id', [''])[0]
    username = body.get('username', [''])[0]
    # password = body.get('password', [''])[0]

    if device_id:
        found = first_device_data_item(device_id)
        if found:
            set_cookie_header_value = create_session({
                'device_id': device_id,
                'username': username,
            })

            return Response(
                body='',
                status_code=302,  # 302 Found for redirection
                headers={
                    'Location': path_resolve('/'),
                    'Set-Cookie': set_cookie_header_value,
                }
            )

    return Response(body='', status_code=302,
                    headers={
                        'Location': path_resolve('/login')
                        + '?error=login_failed'
                    })


@extra_routes.route('/login', methods=['GET'])
def get_login():
    req = extra_routes.current_request
    err = req.query_params.get('error') if req.query_params else None

    html = render_template('login.html', error=err)

    return Response(body=html, status_code=200,
                    headers={'Content-Type': 'text/html;charset=utf-8'})


@extra_routes.route('/logout', methods=['POST'],
                    content_types=['application/x-www-form-urlencoded'])
def post_logout():
    return Response(
        body='',
        status_code=302,
        headers={
            'Location': path_resolve('/login'),
            'Set-Cookie': clear_session(),
        }
    )
