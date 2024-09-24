from ..template import render_template
from chalice import Blueprint, Response

from ..auth import verify_auth, redirect_to_login
from ..data import load_menus, load_mm_codes, load_modes
from ..repositories.device_data import query_device_data_items
from ..repositories.message_type import all_message_type_items

extra_routes = Blueprint(__name__)


@extra_routes.route('/')
def home_page():
    req = extra_routes.current_request
    auth_res = verify_auth(req)
    if not auth_res:
        return redirect_to_login()

    device_id = auth_res['device_id']
    username = auth_res['username']

    # デバイスIDが該当の測定データのデータベースから全取得
    items = query_device_data_items(device_id)

    # コード表のロード
    code_tables = create_code_tables(items)

    # メッセージタイプをデータベースからロード
    msg_types = all_message_type_items()

    html = render_template(
        'home.html',
        device_id=device_id,
        username=username,
        items=items,
        code_tables=code_tables,
        msg_types=msg_types
    )

    return Response(body=html, status_code=200,
                    headers={'Content-Type': 'text/html;charset=utf-8'})


def create_code_tables(items):
    mm_code_map = {}
    menu_map = {}
    mode_map = {}
    for item in items:
        mm_code_map[item['mmCode']] = True
        menu_map[item['menu']] = True
        mode_map[item['mode']] = True

    mm_codes = filter_dict(load_mm_codes(), mm_code_map)
    menus = filter_dict(load_menus(), menu_map)
    modes = filter_dict(load_modes(), mode_map)
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
