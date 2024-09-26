import boto3
from util import aws_resource

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(aws_resource('genai-message-type'))


def all_message_type_items():
    """概要
    DynamoDBメッセージタイプテーブルから全てのアイテムを取得します。

    Returns:
        list: メッセージタイプアイテムのリスト
    """
    response = table.scan()
    items = response['Items']
    while 'LastEvaluatedKey' in response:
        response = table.scan(
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        items.extend(response['Items'])

    # sortOrder値で昇順に並び替え
    results = sorted(items, key=lambda x: x['sortOrder'])
    return list(map(__convert_item, results))


def get_message_type_item(code):
    """概要
    DynamoDBメッセージタイプテーブルから該当コードのアイテムを取得します。

    Args:
        code (string): コード

    Returns:
        dict: メッセージタイプアイテム
    """
    key = {'code': code}
    response = table.get_item(Key=key)
    item = response['Item']
    if item is None:
        return None
    return __convert_item(item)


def __convert_item(item):
    # 特定のフィールドのみを抽出
    return {
        'code': item['code'],
        'name': item['name'],
        'systemPrompt': item['systemPrompt'],
        'userPrompt': item['userPrompt']
    }
