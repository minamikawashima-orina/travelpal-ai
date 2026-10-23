# TravelPal AI

AIと一緒に旅行プランを考えられるチャットボットWebアプリです。

## 概要

旅行先・日数・予算・人数・好みなどを入力すると、AIが条件に合わせた旅行プランを提案します。

本アプリは、Bolt.newで作成したWeb画面をCursorで編集し、DifyのAPIと連携して開発しました。

## 主な機能

- AIとのチャット形式で旅行相談
- 旅行先や日数、予算などに応じた旅行プランの提案
- Difyのチャットボット「旅プランナーAI」とのAPI連携
- 過去の会話を踏まえたチャットの継続

## 使用技術

- Bolt.new
- React
- TypeScript
- Vite
- Tailwind CSS
- Dify API
- Netlify Functions

## 起動方法

1. このリポジトリをダウンロードします。
2. ターミナルでプロジェクトのフォルダを開きます。
3. 依存パッケージをインストールします。

   `npm install`

4. `.env` ファイルを作成し、DifyのAPI設定を行います。

   `DIFY_API_KEY=取得したAPIキー`

   `DIFY_API_URL=https://api.dify.ai/v1`

5. 次のコマンドでアプリを起動します。

   `npm run dev:netlify`

6. ブラウザで `http://localhost:8888` を開きます。

## セキュリティ

APIキーなどの秘密情報は公開せず、環境変数で管理します。`.env` ファイルはGitHubにアップロードしないでください。
