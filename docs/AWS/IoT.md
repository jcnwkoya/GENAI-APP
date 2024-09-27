# IoT Core

IoT Core に関する設定を記載していきます。

## IoT Core ルール：genai_query_payload_poc

| 項目                               | 値                          | 備考                                                                   |
| ---------------------------------- | --------------------------- | ---------------------------------------------------------------------- |
| ルール名                           | genai_query_payload_poc     | AWS 側の命名規則により、`- (ハイフン)`ではなく`_ (アンダーバー)`を使用 |
| SQL のバージョン                   | 2016-03-23                  |                                                                        |
| SQL の内容                         | 以下参照                    |                                                                        |
| ルールアクション                   | DynamoDBV2                  |                                                                        |
| データ保存先の DynamoDB テーブル名 | genai-device-data-poc       |                                                                        |
| IAM ロール                         | genai-device-query-role-poc | IoT Core による DynampDB テーブルへの書き込みを許可                    |

### SQL クエリ

```sql
SELECT
  topic(3) AS deviceId,
  timestamp() AS timestamp,
  MENU AS menu,
  MODE AS mode,
  cast(CODE as String) AS mmCode,
FROM
  'pub/poc/#'
```

### テスト用メッセージペイロード

ZENWA デバイスが手元にない状態でも、デバイスからのデータに形式を揃えてメッセージを手動発行すれば、動作検証が可能です。

デバイスは現在 2 台登録してあるため、下記のいずれかのトピック名を指定してメッセージを発行できます。

- トピック名
  - `pub/poc/KZ012312X0009`
  - `pub/poc/KZ012312X0010`
  - `pub/poc/#`

メッセージペイロードは以下の通り

```
{
  "MENU" : 1,
  "MODE": 0,
  "CODE" : 15113
}
```

## IoT Core ポリシー

IoT Core に登録されており、かつ証明書発行済みのデバイスのみ、データのやりとりを許可しています。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Condition": {
        "Bool": {
          "iot:Connection.Thing.IsAttached": ["true"]
        }
      },
      "Effect": "Allow",
      "Action": "iot:Connect",
      "Resource": "arn:aws:iot:ap-northeast-1:767398143080:client/${iot:Connection.Thing.ThingName}"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Publish",
      "Resource": "arn:aws:iot:ap-northeast-1:767398143080:topic/pub/poc/${iot:Connection.Thing.ThingName}"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Receive",
      "Resource": "arn:aws:iot:ap-northeast-1:767398143080:topic/sub/poc/${iot:Connection.Thing.ThingName}"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Subscribe",
      "Resource": "arn:aws:iot:ap-northeast-1:767398143080:topicfilter/sub/poc/${iot:Connection.Thing.ThingName}"
    }
  ]
}
```
