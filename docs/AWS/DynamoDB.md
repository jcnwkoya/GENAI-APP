# DynamoDB

DynamoDB テーブルに関する設定です。

## genai-device-data-poc

IoT デバイスからのデータを保存するテーブルです。

| 属性                           | 型     | 備考                                                |
| ------------------------------ | ------ | --------------------------------------------------- |
| deviceId（パーティションキー） | string | デバイスに割り振られた ID                           |
| timestamp（ソートキー）        | number | UNIX のエポック時間（単位：ミリ秒）                 |
| menu                           | number | 1~18 までの数値                                     |
| mmCode                         | string | 5 桁の数値（先頭の 0 を省略させないため string 型） |
| mode                           | number | 0: エーテル / 1: アストラル                         |

### DynamoDB に保存されるデータの例

```json
{
  "deviceId": "KZ012312X0010",
  "timestamp": 1722238795000,
  "menu": 1,
  "mmCode": "15113",
  "mode": 0
}
```

## genai-message-history-poc

メッセージ履歴を保存するテーブルです。

| 属性                           | 型     | 備考                                |
| ------------------------------ | ------ | ----------------------------------- |
| deviceId（パーティションキー） | string | デバイスに割り振られた ID           |
| timestamp（ソートキー）        | number | UNIX のエポック時間（単位：ミリ秒） |
| message                        | string | 生成した AI メッセージ              |
| model                          | string | AI モデル ID                        |
| prompt                         | string | 生成時に指定したプロンプト          |

### DynamoDB に保存されるデータの例

```json
{
  "deviceId": "KZ012312X0010",
  "timestamp": 1722238795000,
  "message": "独断的な態度や他者を排除する傾向は、時に自己防衛の一環と＜中略＞つながっていくのではないでしょうか。",
  "model": "anthropic.claude-3-haiku-20240307-v1:0",
  "prompt": "男性で「独断的な」,「排除」を感じている人にスピリチュアルなポジティブアドバイスを箇条書きではなく自然な文体で200文字程度でしてください"
}
```

## genai-message-type-poc

メッセージタイプの選択肢を保存するテーブルです。

| 属性                       | 型     | 備考                                           |
| -------------------------- | ------ | ---------------------------------------------- |
| code（パーティションキー） | string | メッセージタイプのコード                       |
| name                       | string | 画面上の選択項目に表示する名前                 |
| sortOrder                  | number | 画面上の選択項目に表示順（昇順に適用）         |
| systemPrompt               | string | 生成 AI に指定するシステムプロンプト（未使用） |
| userPrompt                 | string | 生成 AI に指定するユーザープロンプト           |

### userPrompt の埋め込み変数

- `${menu}` - メニューに置換されます。
- `${words}` - 選択された測定コードの日本語名リストに置換されます。
- `${charnum}` - メッセージ文字数に置換されます。

### DynamoDB に保存されるデータの例

```json
{
  "code": "spiritual",
  "name": "スピリチュアル",
  "sortOrder": 1,
  "systemPrompt": "",
  "userPrompt": "${menu}${words}を感じている人にスピリチュアルなポジティブアドバイスを箇条書きではなく自然な文体で${charnum}文字程度でしてください"
}
```
