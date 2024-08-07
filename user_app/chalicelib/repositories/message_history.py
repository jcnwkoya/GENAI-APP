import boto3


def put_message_history_item(device_id, timestamp, model, words, message):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('genai-message-history-poc')
    table.put_item(
        Item={
            'device_id': device_id,
            'timestamp': timestamp,
            'model': model,
            'words': words,
            'message': message
        }
    )
