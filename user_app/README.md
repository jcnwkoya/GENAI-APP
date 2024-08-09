# ユーザー用アプリケーション (genai-user-app)

## ローカルでサーバー起動

```
$ cd user_app
$ chalice local
```

## ステージ poc のデプロイ

## Chalice 用に requirements.txt を出力

```
$ poetry export --format requirements.txt --output requirements.txt
```

## デプロイ実行

```
$ chalice deploy --stage poc
```
