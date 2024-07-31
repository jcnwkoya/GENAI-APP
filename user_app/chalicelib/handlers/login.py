from chalice import Blueprint, Response
from urllib.parse import parse_qs
from logging import getLogger

logger = getLogger(__name__)

extra_routes = Blueprint(__name__)

@extra_routes.route('/login', methods=['POST'], content_types=['application/x-www-form-urlencoded'], cors=True)
def post_login():
    req = extra_routes.current_request
    body = parse_qs(req.raw_body.decode('utf-8'))
    username = body.get('username', [''])[0]
    password = body.get('password', [''])[0]

    if username == 'admin' and password == 'password':
        location = '/'
    else:
        location = '/login?error=Invalid+username+or+password'

    return Response(body='', status_code=302, headers={'Location': location})

@extra_routes.route('/login', methods=['GET'])
def get_login():
    req = extra_routes.current_request
    error_message = req.query_params.get('error') if req.query_params else None

    html = f"""
    <html>
        <head>
            <title>ログイン</title>
            <style>
                .error {{
                    color: red;
                    font-weight: bold;
                }}
            </style>
        </head>
        <body>
            <h1>ログイン</h1>
            {f'<p class="error">Error: {error_message}</p>' if error_message else ''}
            <form method="post">
                <input type="text" name="username" placeholder="ユーザー名" required>
                <input type="password" name="password" placeholder="パスワード" required>
                <input type="submit" value="ログイン">
            </form>
        </body>
    </html>
    """
    return Response(body=html, status_code=200, headers={'Content-Type': 'text/html;charset=utf-8'})
