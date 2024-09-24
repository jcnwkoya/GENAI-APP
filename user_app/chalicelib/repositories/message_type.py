import boto3
from ..util import aws_resource

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(aws_resource('genai-message-type'))


def all_message_type_items():
    response = table.scan()
    items = response['Items']
    while 'LastEvaluatedKey' in response:
        response = table.scan(
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        items.extend(response['Items'])

    # sortOrder値で昇順に並び替え
    results = sorted(items, key=lambda x: x['sortOrder'])
    return list(map(convert_item, results))


def get_message_type_item(code):
    key = {'code': code}
    response = table.get_item(Key=key)
    item = response['Item']
    if item is None:
        return None
    return convert_item(item)


def convert_item(item):
    # 特定のフィールドのみを抽出
    return {
        'code': item['code'],
        'name': item['name'],
        'systemPrompt': item['systemPrompt'],
        'userPrompt': item['userPrompt']
    }
