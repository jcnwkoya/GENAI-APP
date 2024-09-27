# リテラシステム研究所 生成 AI アプリ

## 環境セットアップ

## Visual Studio Code

- 拡張 (Extensions) に **Python** を追加

## Python, Poetry

### macOS, Linux (WSL含む)

1. [mise](https://mise.jdx.dev/) をインストール
2. mise の poetry プラグインをインストール `mise plugin add poetry`
3. `mise install` を実行

### venv のディレクトリ (.venv) を作成

Visual Studio Code のターミナルを開いて、 `python -m venv .venv` を実行する。

## 依存ライブラリのインストール

Visual Studio Code のターミナルを開いて、 `poetry install` を実行する。

## requirements.txt 出力用 Poetry プラグインのインストール

Visual Studio Code のターミナルを開いて、 `poetry self add poetry-plugin-export` を実行する。
