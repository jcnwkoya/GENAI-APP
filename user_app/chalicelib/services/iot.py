import boto3


def send_command(device_id, fnc, data, eoc):
    """概要
    指定されたデバイスに本体制御コマンドを送信します。

    Args:
        device_id (string): デバイスID
        fnc (string): コマンド文字列
        data (string): データ文字列
        eoc (string): 終端文字
    """
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
