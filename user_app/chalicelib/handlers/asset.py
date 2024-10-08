import os
from chalice import Blueprint, Response

extra_routes = Blueprint(__name__)


@extra_routes.route('/assets/{file_path}')
def serve_static_file(file_path):
    asset_path = os.path.join(os.path.dirname(
        __file__), '../assets', file_path)

    if not os.path.isfile(asset_path):
        return Response(body='File not found', status_code=404)

    # ファイルの内容をまるっと読み込む
    with open(asset_path, 'rb') as f:
        content = f.read()

    # ファイルの拡張子に応じて適切なContent-Typeを設定
    content_type = 'text/plain'
    if file_path.endswith('.js'):
        content_type = 'application/javascript'
    elif file_path.endswith('.css'):
        content_type = 'text/css'

    return Response(body=content, headers={'Content-Type': content_type})
