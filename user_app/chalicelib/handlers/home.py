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
        return redirect_to_login()

    device_id = auth_res['device_id']
    username = auth_res['username']

    device_data_items = query_device_data_items(device_id)
    items = convert_device_data_items(device_data_items)
    code_tables = create_code_tables(items)

    html = render_template(
        'home.html',
        device_id=device_id,
        username=username,
        items=items,
        code_tables=code_tables
    )

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


def create_code_tables(items):
    mm_code_map = {}
    menu_map = {}
    mode_map = {}
    for item in items:
        mm_code_map[item['mmCode']] = True
        menu_map[item['menu']] = True
        mode_map[item['mode']] = True

    mm_codes = filter_dict(load_data('mm_code'), mm_code_map)
    menus = filter_dict(load_data('menu'), menu_map)
    modes = filter_dict(load_data('mode'), mode_map)
    return {
        'mmCodes': mm_codes,
        'menus': menus,
        'modes': modes
    }


def filter_dict(dict, include_map):
    result_dict = {}
    for val, name in dict.items():
        if val in include_map:
            result_dict[val] = name
    return result_dict
