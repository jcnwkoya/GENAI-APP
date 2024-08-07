import time
import boto3


def put_message_history_item(device_id, model, words, message):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('genai-message-history-poc')
    table.put_item(
        Item={
            'deviceId': device_id,
            'timestamp': int(time.time()),
            'model': model,
            'words': words,
            'message': message
        }
    )
