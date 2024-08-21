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
    ai = body.get('ai', '')
    msglen = body.get('msglen', 0)
    prompt = body.get('prompt', '')

    try:
        # メッセージ生成
        model = False
        if ai == 'bedrock/claude3-haiku':
            model = 'anthropic.claude-3-haiku-20240307-v1:0'
            region = 'ap-northeast-1'
        elif ai == 'bedrock/claude3-5-sonnet':
            model = 'anthropic.claude-3-5-sonnet-20240620-v1:0'
            region = 'ap-northeast-1'
        elif ai == 'bedrock/mistral-7b':
            model = 'mistral.mistral-7b-instruct-v0:2'
            region = 'us-west-2'
        elif ai == 'bedrock/llama3-1-8b':
            model = 'meta.llama3-1-8b-instruct-v1:0'
            region = 'us-west-2'

        if model is False or prompt is False:
            return Response(
                body=json.dumps({'message': 'AIのメッセージ生成に失敗しました。'}),
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        message = generate_message(region, model, prompt, msglen)
        logger.info('Succeeded to generate message', {
            'device_id': device_id,
            'prompt': prompt,
            'message': message
        })

        put_message_history_item(device_id, model, prompt, message)

        return Response(
            body=json.dumps({'message': message}),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        logger.error(e)
        return Response(
            body=json.dumps({'message': 'AIのメッセージ生成に失敗しました。'}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
