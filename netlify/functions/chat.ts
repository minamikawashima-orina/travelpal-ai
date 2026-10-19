import type { Config } from '@netlify/functions';
import type { ChatApiRequest, ChatApiResponse } from '../../src/types/chat';

// ブラウザと Dify API の間に入る中継役（サーバー側でだけ動く）
// APIキーは環境変数から読み込み、ブラウザには一切返さない

const DEFAULT_DIFY_API_URL = 'https://api.dify.ai/v1';
const MAX_QUERY_LENGTH = 2000;
const MAX_ID_LENGTH = 100;

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

// Dify のエラーをユーザー向けのメッセージに変換（内部情報は含めない）
function toUserMessage(status: number): string {
  if (status === 401 || status === 403) return 'AIサービスの認証に失敗しました。APIキーの設定を確認してください。';
  if (status === 429) return 'AIサービスが混み合っています。少し時間をおいてお試しください。';
  return 'AIサービスからの応答取得に失敗しました。時間をおいてお試しください。';
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return json({ error: 'POST で送信してください。' }, 405);
  }

  const apiKey = Netlify.env.get('DIFY_API_KEY');
  const apiUrl = (Netlify.env.get('DIFY_API_URL') || DEFAULT_DIFY_API_URL).replace(/\/+$/, '');
  if (!apiKey) {
    console.error('DIFY_API_KEY が設定されていません');
    return json({ error: 'サーバーの設定が完了していません（APIキー未設定）。' }, 500);
  }

  let body: Partial<ChatApiRequest>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'リクエストの形式が正しくありません。' }, 400);
  }

  const query = typeof body.query === 'string' ? body.query.trim() : '';
  const conversationId = typeof body.conversation_id === 'string' ? body.conversation_id : '';
  const user = typeof body.user === 'string' ? body.user : '';

  if (!query) return json({ error: '質問文を入力してください。' }, 400);
  if (query.length > MAX_QUERY_LENGTH) {
    return json({ error: `質問文は${MAX_QUERY_LENGTH}文字以内で入力してください。` }, 400);
  }
  if (!user || user.length > MAX_ID_LENGTH || conversationId.length > MAX_ID_LENGTH) {
    return json({ error: 'リクエストの形式が正しくありません。' }, 400);
  }

  let difyRes: Response;
  try {
    difyRes = await fetch(`${apiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        inputs: {},
        response_mode: 'blocking',
        conversation_id: conversationId,
        user,
      }),
    });
  } catch (err) {
    console.error('Dify API への接続に失敗しました', err);
    return json({ error: 'AIサービスに接続できませんでした。' }, 502);
  }

  const data = await difyRes.json().catch(() => null);

  if (!difyRes.ok) {
    console.error('Dify API エラー', difyRes.status, data?.code, data?.message);
    // 会話IDが期限切れ・削除済みの場合は、ブラウザ側で会話をリセットしてもらう
    if (difyRes.status === 404 && conversationId) {
      return json({ error: '会話が見つかりませんでした。', code: 'conversation_not_found' }, 404);
    }
    return json({ error: toUserMessage(difyRes.status) }, 502);
  }

  if (typeof data?.answer !== 'string') {
    console.error('Dify API の応答形式が想定外です');
    return json({ error: toUserMessage(500) }, 502);
  }

  const result: ChatApiResponse = {
    answer: data.answer,
    conversation_id: typeof data.conversation_id === 'string' ? data.conversation_id : conversationId,
  };
  return json(result);
};

export const config: Config = {
  path: '/api/chat',
};
