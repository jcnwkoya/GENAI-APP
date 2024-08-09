import boto3


def generate_message(region, model, prompt, char_count):
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
            'maxTokens': char_count * 3,
            'temperature': 0.5,
        },
    )
    out_message = response['output']['message']['content'][0]['text']
    return out_message
