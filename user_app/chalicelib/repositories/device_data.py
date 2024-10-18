import boto3
from boto3.dynamodb.conditions import Key, Attr
from ..util import aws_resource

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(aws_resource('genai-device-data'))


def query_device_data_items(device_id, user):
    """概要
    DynamoDBデバイスデータテーブルから指定されたデバイスIDのデータを全て取得します。

    Args:
        device_id (string): デバイスID
        user (int): ユーザーNo.

    Returns:
        list: 測定データ項目の配列
    """
    # データベースへ最初の要求
    key_cond = Key('deviceId').eq(device_id)
    filter_exp = Attr('user').eq(user)
    response = table.query(
        KeyConditionExpression=key_cond,
        FilterExpression=filter_exp,
    )
    items = response['Items']

    # 続きがある場合はLastEvaluatedKeyが存在するので、繰り返し要求
    while 'LastEvaluatedKey' in response:
        response = table.query(
            KeyConditionExpression=key_cond,
            FilterExpression=filter_exp,
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
            'user': str(item['user']).zfill(2),  # 先頭0埋め
        }
        results.insert(0, transformed_item)  # 降順にするために先頭に挿入
        i -= 1
    return results


def first_device_data_item(device_id, user):
    """概要
    DynamoDBデバイスデータテーブルから指定されたデバイスIDの先頭のデータ1件を取得します。

    Args:
        device_id (string): デバイスID
        user (int): ユーザーNo.

    Returns:
        dict|False: 項目、なければFalse
    """
    key_cond = Key('deviceId').eq(device_id)
    filter_exp = Attr('user').eq(user)
    response = table.query(
        KeyConditionExpression=key_cond,
        FilterExpression=filter_exp,
        Limit=1
    )
    items = response['Items']
    if len(items) == 1:
        return items[0]
    return False


def get_device_data_item(device_id, timestamp):
    """概要
    DynamoDBデバイスデータテーブルから指定されたデバイスIDとタイムスタンプのデータを取得します。

    Args:
        device_id (string): デバイスID
        timestamp (int): タイムスタンプ
    """
    response = table.get_item(
        Key={
            'deviceId': device_id,
            'timestamp': timestamp
        }
    )

    # レスポンスにItemが含まれているかチェック
    if 'Item' in response:
        return response['Item']
    else:
        return False


def put_device_data_item(device_id, timestamp, mm_code, menu, mode, user):
    """概要
    DynamoDBデバイスデータテーブルにアイテムを保存します。

    Args:
        device_id (string): デバイスID
        timestamp (int): タイムスタンプ
        mm_code (string): 測定コード
        menu (int): メニュー
        mode (int): モード
        user (int): ユーザーNo.
    """
    response = table.put_item(
        Item={
            'deviceId': device_id,
            'timestamp': timestamp,
            'mmCode': int(mm_code),  # 先頭0は削除され数値に変換
            'menu': menu,
            'mode': mode,
            'user': user,
        }
    )
    return response


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
