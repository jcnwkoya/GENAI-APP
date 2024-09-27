# IAM ロール一覧

| ロール名                    | 説明                         |
| --------------------------- | ---------------------------- |
| genai-user-app-poc          | Lambda 用 IAM ロール         |
| genai-device-query-role-poc | IoT Core ルール用 IAM ロール |

## genai-user-app-poc

### カスタマー管理ポリシー

- genai-user-app-poc

```
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"logs:CreateLogGroup",
				"logs:CreateLogStream",
				"logs:PutLogEvents"
			],
			"Resource": "arn:*:logs:*:*:*"
		}
	]
}
```

## genai-device-query-role-poc

### カスタマー管理ポリシー

- aws-iot-rule-genai_query_payload_poc-action-1-role-genai-device-query-role-poc

```
{
    "Version": "2012-10-17",
    "Statement": {
        "Effect": "Allow",
        "Action": "dynamodb:PutItem",
        "Resource": "arn:aws:dynamodb:ap-northeast-1:767398143080:table/genai-device-data-poc"
    }
}
```
