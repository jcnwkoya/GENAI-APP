import json
from chalice import Blueprint, Response
from logging import getLogger

from ..ai_services.bedrock import generate_message
from ..auth import verify_auth
from ..repositories.message_history import put_message_history_item

logger = getLogger(__name__)

extra_routes = Blueprint(__name__)


@extra_routes.route('/message', methods=['POST'])
def post_message():
    req = extra_routes.current_request
    auth_res = verify_auth(req)
    if not auth_res:
        return Response(body='Unauthorized', status_code=401)

    device_id = auth_res['device_id']
    body = req.json_body
    words = body.get('words', [])
    ai = body.get('ai', 'bedrock-claude3-haiku')
    msgtype = body.get('msgtype', 'スピリチュアル')
    msglen = body.get('msglen', 'short')

    char_cnt = 50
    if msglen == 'short':
        char_cnt = 50
    elif msglen == 'medium':
        char_cnt = 200
    elif msglen == 'long':
        char_cnt = 400

    try:
        # メッセージ生成
        if ai == 'bedrock-claude3-haiku':
            model = 'anthropic.claude-3-haiku-20240307-v1:0'
            message = generate_message(words, model, msgtype, char_cnt)

        if message:
            put_message_history_item(device_id, model, words, message)

            return Response(
                body=json.dumps({'message': message}),
                status_code=200,
                headers={'Content-Type': 'application/json'}
            )
        else:
            return Response(
                body=json.dumps({'message': 'AIのメッセージ生成に失敗しました。'}),
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
    except Exception as e:
        logger.error(e)
        return Response(
            body=json.dumps({'message': 'AIのメッセージ生成に失敗しました。'}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
