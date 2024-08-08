import boto3
from logging import getLogger

logger = getLogger(__name__)


def generate_message(words, region, model, msgtype, char_count):
    words_joined = "と".join(words)

    prompt = f'{words_joined}を感じている人に{
        msgtype}な考え方を踏まえてポジティブアドバイスを箇条書きではなく自然な文体で{char_count}文字程度でしてください'

    logger.info(prompt)

    client = boto3.client('bedrock-runtime', region_name=region)
    response = client.converse(
        modelId=model,
        messages=[
            {
                'role': 'user',
                'content': [
                    {
                        'text': prompt,
                    },
                ]
            },
        ],
        inferenceConfig={
            'maxTokens': int(char_count * 4),
            'temperature': 0.5,
        },
    )
    out_message = response['output']['message']['content'][0]['text']
    logger.info(out_message)

    return out_message
