import json
from chalice import Blueprint, Response
from jinja2 import Template
from logging import getLogger

from ..ai_services.bedrock import generate_message
from ..auth import verify_auth
from ..repositories.message_history import put_message_history_item
from ..repositories.message_type import get_message_type_item

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
    ai = body.get('ai', '')
    msgtype = body.get('msgtype', '')
    msglen = body.get('msglen', 'short')
    free_prompt = body.get('prompt', '')

    char_cnt = _message_length(msglen)
    print(char_cnt)
    print(msgtype)
    print(free_prompt)
    prompt = _create_prompt(words, char_cnt, msgtype, free_prompt)
    print(prompt)
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

        message = generate_message(region, model, prompt, char_cnt)
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


def _message_length(msglen):
    if msglen == 'short':
        return 50
    elif msglen == 'medium':
        return 200
    elif msglen == 'long':
        return 400
    else:
        return 50


def _create_prompt(words, char_cnt, msgtype, free_prompt):
    if msgtype == 'free':
        user_prompt = free_prompt
    else:
        msg_type_item = get_message_type_item(msgtype)
        if msg_type_item is None:
            return False
        user_prompt = msg_type_item['userPrompt']

    words_joined = "と".join(words)

    return f'{words_joined}を感じている人に下記に基づいてポジティブアドバイスを箇条書きではなく自然な文体で{char_cnt}文字程度でしてください\n\n' + user_prompt
