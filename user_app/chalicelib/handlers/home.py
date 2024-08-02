from chalice import Blueprint, Response
from ..auth import authorize
from ..template import render_template

extra_routes = Blueprint(__name__)

@extra_routes.route('/')
def home_page():
    req = extra_routes.current_request
    auth_res = authorize(req)
    if auth_res:
        return auth_res

    error_message = req.query_params.get('error') if req.query_params else None

    html = render_template('home.html', error_message=error_message)

    return Response(body=html, status_code=200, headers={'Content-Type': 'text/html;charset=utf-8'})
