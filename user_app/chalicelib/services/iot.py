import boto3


def send_command(device_id, fnc, data, eoc):
    topic = 'sub/poc/' + device_id
    payload = fnc + data + eoc

    client = boto3.client('iot-data')
    client.publish(
        topic=topic,
        qos=1,
        payload=payload,
        contentType='text/plain',
        correlationData='string',
        payloadFormatIndicator='UTF8_DATA',
    )
