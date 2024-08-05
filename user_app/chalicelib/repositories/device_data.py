import boto3
from boto3.dynamodb.conditions import Key


def query_device_data_items(device_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('genai-device-data-poc')
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

    return items
