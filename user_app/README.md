# ユーザー用アプリケーション (genai-user-app)

## 使用フレームワークおよびライブラリ

* [Chalice](https://aws.github.io/chalice/) - AWS API GatewayとLambdaのサーバレスアプリケーションフレームワーク
* [jinja2](https://jinja.palletsprojects.com/) - テンプレートエンジン HTMLレンダリング用
* [boto3](https://aws.amazon.com/jp/sdk-for-python/) - AWS SDK

## ファイル、フォルダ構成

* .chalice - Chaliceの設定フォルダ
  * config.json - アプリ名やステージの設定
  * policy-{env}.json - 各環境のIAMポリシーの設定
* chalicelib
  * ai_services - 外部AIサービスの呼び出し処理
  * assets - ブラウザで読み込むJavaScriptファイルやCSSファイルの置き場所
  * data - 各コード表のデータを定義したTSVファイルの置き場所
    * menu.tsv - メニューデータ
    * mm_code.tsv - 測定コードデータ
    * mode.tsv - モードデータ
  * handlers - API呼び出し時にトリガーされる処理
  * repositories - データベースへの処理
  * service - AWSマネージドサービスの呼び出し処理
  * templates - HTMLテンプレートファイルの置き場所
  * auth.py - 認証処理
  * data.py - dataフォルダのデータを読み込む処理
  * template.py - templatesフォルダのテンプレートファイルをレンダリングする処理
  * util.py - ユーティリティ関数の定義
* app.py - このアプリケーションの初期化処理

## 操作

下記の操作は `user_app` ディレクトリ内で行います。

### ライブラリの追加

```sh
poetry add <package-name>
```

### Chalice用に requirements.txt を出力

ライブラリ追加時に実行します。

```sh
poetry export --format requirements.txt --output requirements.txt
```

### ローカルでサーバーを起動

#### ターミナル

```sh
chalice local
```

#### Visual Studio Code

1. 左のアイコンリストから **Run and Debug** を選択
2. ドロップダウンリストから **Chalice** を選択
3. 再生ボタン **Start debugging** を押下

### POC環境へのデプロイを実行

```sh
chalice deploy --stage poc
```

### 本番環境へのデプロイを実行

```sh
chalice deploy --stage prd
```
