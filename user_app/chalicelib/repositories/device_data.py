import boto3
from boto3.dynamodb.conditions import Key
from ..util import aws_resource

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(aws_resource('genai-device-data'))


def query_device_data_items(device_id):
    """概要
    DynamoDBデバイスデータテーブルから指定されたデバイスIDのデータを全て取得します。

    Args:
        device_id (string): デバイスID

    Returns:
        list: 測定データ項目の配列
    """
    # データベースへ最初の要求
    key_cond = Key('deviceId').eq(device_id)
    response = table.query(
        KeyConditionExpression=key_cond
    )
    items = response['Items']

    # 続きがある場合はLastEvaluatedKeyが存在するので、繰り返し要求
    while 'LastEvaluatedKey' in response:
        response = table.query(
            KeyConditionExpression=key_cond,
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        items.extend(response['Items'])

    # 取得した全項目をフィールの型変換をしつつ逆順にします。
    results = []
    i = len(items)
    for item in items:
        transformed_item = {
            'id': i,  # 1始まりのナンバリング
            'timestamp': int(item['timestamp']),
            'mmCode': str(item['mmCode']).zfill(5),  # 先頭0埋め
            'menu': int(item['menu']),
            'mode': int(item['mode']),
        }
        results.insert(0, transformed_item)  # 降順にするために先頭に挿入
        i -= 1
    return results


def first_device_data_item(device_id):
    """概要
    DynamoDBデバイスデータテーブルから指定されたデバイスIDの先頭のデータ1件を取得します。

    Args:
        device_id (string): デバイスID

    Returns:
        dict|False: 項目、なければFalse
    """
    key_cond = Key('deviceId').eq(device_id)
    response = table.query(
        KeyConditionExpression=key_cond,
        Limit=1
    )
    items = response['Items']
    if len(items) == 1:
        return items[0]
    return False


def delete_device_data_item(device_id, timestamp):
    """概要
    DynamoDBデバイスデータテーブルから指定されたデバイスIDとタイムスタンプのデータを削除します。

    Args:
        device_id (string): デバイスID
        timestamp (int): タイムスタンプ
    """
    response = table.delete_item(
        Key={
            'deviceId': device_id,
            'timestamp': timestamp
        }
    )
    return response
