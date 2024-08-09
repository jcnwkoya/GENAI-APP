import time
import boto3
from ..util import aws_resource

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(aws_resource('genai-message-history'))


def put_message_history_item(device_id, model, words, message):
    table.put_item(
        Item={
            'deviceId': device_id,
            'timestamp': int(time.time()),
            'model': model,
            'words': words,
            'message': message
        }
    )
