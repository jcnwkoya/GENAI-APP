from chalice import Blueprint, Response

from ..auth import verify_auth, redirect_to_login
from ..data import load_data
from ..repositories.device_data import query_device_data_items
from ..template import render_template

extra_routes = Blueprint(__name__)


@extra_routes.route('/')
def home_page():
    req = extra_routes.current_request
    auth_res = verify_auth(req)
    if not auth_res:
        return redirect_to_login

    error_message = req.query_params.get('error') if req.query_params else None

    device_data_items = query_device_data_items('KZ012312X0009')
    items = convert_device_data_items(device_data_items)
    print(items)

    codes = load_data('code')
    menus = load_data('menu')
    modes = load_data('mode')

    html = render_template(
        'home.html',
        error_message=error_message,
        items=items,
        codes=codes,
        menus=menus,
        modes=modes)

    return Response(body=html, status_code=200,
                    headers={'Content-Type': 'text/html;charset=utf-8'})


def convert_device_data_items(items):
    results = []
    i = len(items)
    for item in items:
        transformed_item = {
            'id': i,
            'timestamp': int(item['timestamp']),
            'mmCode': int(item['mmCode']),
            'menu': int(item['menu']),
            'mode': int(item['mode']),
        }
        results.insert(0, transformed_item)
        i -= 1
    return results
