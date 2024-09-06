import json
from chalice import Blueprint, Response
from logging import getLogger

from ..auth import verify_auth
from ..services.iot import send_command

logger = getLogger(__name__)

extra_routes = Blueprint(__name__)


@extra_routes.route('/command', methods=['POST'])
def post_command():
    req = extra_routes.current_request
    auth_res = verify_auth(req)
    if not auth_res:
        return Response(body='Unauthorized', status_code=401)

    device_id = auth_res['device_id']
    body = req.json_body
    fnc = body.get('fnc', '')
    mnu = body.get('menu', '').zfill(2)  # 先頭0埋め2文字に

    try:
        if fnc == 'cde':
            # 測定コード送出
            mmcodes = body.get('mmcodes', [])
            data = mnu + ''.join(mmcodes)
        elif fnc == 'msg':
            # message = body.get('message', '')
            data = mnu + 'HELLO'
        elif fnc == 'mnu':
            data = mnu
        else:
            data = ''

        send_command(device_id, fnc, data, '?')
        logger.info('Succeeded to send command', {
            'device_id': device_id,
            'fnc': fnc,
            'data': data
        })

        return Response(
            body=json.dumps({}),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        logger.error(e)
        return Response(
            body=json.dumps({'command': 'コマンドの送信に失敗しました。'}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
