import boto3
from boto3.dynamodb.conditions import Key


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('genai-device-data-poc')


def query_device_data_items(device_id):
    key_cond = Key('deviceId').eq(device_id)
    response = table.query(
        KeyConditionExpression=key_cond
    )
    items = response['Items']

    while 'LastEvaluatedKey' in response:
        response = table.query(
            KeyConditionExpression=key_cond,
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        items.extend(response['Items'])

    results = []
    i = len(items)
    for item in items:
        transformed_item = {
            'id': i,
            'timestamp': int(item['timestamp']),
            'mmCode': str(item['mmCode']).zfill(5),  # 先頭0埋め
            'menu': int(item['menu']),
            'mode': int(item['mode']),
        }
        results.insert(0, transformed_item)  # 降順にするために先頭に挿入
        i -= 1
    return results


def first_device_data_item(device_id):
    key_cond = Key('deviceId').eq(device_id)
    response = table.query(
        KeyConditionExpression=key_cond,
        Limit=1
    )
    items = response['Items']
    if len(items) == 1:
        return items[0]
    return False
