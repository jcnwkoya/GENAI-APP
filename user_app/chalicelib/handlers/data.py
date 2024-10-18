from chalice import Blueprint, Response
from logging import getLogger

from ..data import load_menus, load_mm_codes, load_modes
from ..template import render_template

logger = getLogger(__name__)

extra_routes = Blueprint(__name__)


@extra_routes.route("/data", methods=["GET"])
def data_page():
    # コード表のロード
    menus = reverse_menus(load_menus())
    modes = reverse_dict(load_modes())
    code_tables = {
        'menus': menus,
        'modes': modes
    }

    html = render_template(
        'data.html',
        code_tables=code_tables,
    )

    return Response(body=html, status_code=200,
                    headers={'Content-Type': 'text/html;charset=utf-8'})


def reverse_dict(dict):
    """概要
    コード表の辞書のキーと値を逆にして返します。

    Args:
        dict (dict): コード表の辞書

    Returns:
        dict: キーがコード名で、値がコード値の辞書
    """
    result_dict = {}
    for val, name in dict.items():
        result_dict[name] = val
    return result_dict


def reverse_menus(dict):
    """概要
    コード表の辞書のキーと値を逆にして返します。

    Args:
        dict (dict): コード表の辞書

    Returns:
        dict: キーがコード名で、値がコード値の辞書
    """
    result_dict = {}
    for key, val in dict.items():
        result_dict[val['label']] = key
    return result_dict
