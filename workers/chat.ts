import {
  checkBurst,
  HttpError,
  json,
  readJSON,
  type Env,
  type Visitor,
} from './shared';

type Thread = { id: string };
type Message = {
  id: number;
  sender: 'visitor' | 'owner';
  content: string;
  createdAt: string;
};

const messageColumns = 'id, sender, content, created_at AS createdAt';

function database(env: Env) {
  if (!env.SITE_DB) {
    throw new HttpError(
      503,
      'Chat is not configured yet. Please try again later.',
    );
  }
  return env.SITE_DB;
}

function content(body: Record<string, unknown>) {
  if (typeof body.message !== 'string') {
    throw new HttpError(400, 'Enter a message.');
  }
  const message = body.message.trim();
  if (!message || message.length > 2000) {
    throw new HttpError(
      400,
      'Messages must contain between 1 and 2,000 characters.',
    );
  }
  return message;
}

async function messages(env: Env, threadId: string, request?: Request) {
  const db = database(env);
  const cursor = request
    ? new URL(request.url).searchParams.get('after')
    : null;
  if (cursor !== null) {
    if (!/^\d+$/.test(cursor) || !Number.isSafeInteger(Number(cursor))) {
      throw new HttpError(400, 'The message cursor is invalid.');
    }
    const result = await db
      .prepare(
        `SELECT ${messageColumns} FROM chat_messages WHERE thread_id = ? AND id > ? ORDER BY id ASC LIMIT 100`,
      )
      .bind(threadId, Number(cursor))
      .all<Message>();
    if (!result.success)
      throw new HttpError(
        503,
        'Messages could not be loaded. Please try again.',
      );
    return result.results;
  }
  const result = await db
    .prepare(
      `SELECT ${messageColumns} FROM chat_messages WHERE thread_id = ? ORDER BY id DESC LIMIT 100`,
    )
    .bind(threadId)
    .all<Message>();
  if (!result.success)
    throw new HttpError(503, 'Messages could not be loaded. Please try again.');
  return result.results.reverse();
}

async function append(
  env: Env,
  threadId: string,
  sender: 'visitor' | 'owner',
  message: string,
) {
  const db = database(env);
  const result = await db.batch([
    db
      .prepare(
        'INSERT INTO chat_messages (thread_id, sender, content) VALUES (?, ?, ?)',
      )
      .bind(threadId, sender, message),
    db
      .prepare(
        "UPDATE chat_threads SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
      )
      .bind(threadId),
  ]);
  if (result.some((item) => !item.success))
    throw new HttpError(
      503,
      'Your message could not be saved. Please try again.',
    );
}

export async function handleChat(
  request: Request,
  env: Env,
  visitor: Visitor,
): Promise<Response> {
  const db = database(env);
  if (request.method !== 'GET' && request.method !== 'POST') {
    throw new HttpError(405, 'This method is not supported.');
  }
  let thread = await db
    .prepare('SELECT id FROM chat_threads WHERE visitor_key = ?')
    .bind(visitor.id)
    .first<Thread>();
  if (request.method === 'POST') {
    const message = content(await readJSON(request));
    await checkBurst(request, visitor, 'chat-send', 5, 60000);
    if (!thread) {
      // UNIQUE visitor_key prevents parallel sends from creating separate conversations.
      const created = await db
        .prepare(
          'INSERT OR IGNORE INTO chat_threads (id, visitor_key) VALUES (?, ?)',
        )
        .bind(crypto.randomUUID(), visitor.id)
        .run();
      if (!created.success)
        throw new HttpError(
          503,
          'Your conversation could not be created. Please try again.',
        );
      thread = await db
        .prepare('SELECT id FROM chat_threads WHERE visitor_key = ?')
        .bind(visitor.id)
        .first<Thread>();
    }
    if (!thread)
      throw new HttpError(
        503,
        'Your message could not be saved. Please try again.',
      );
    await append(env, thread.id, 'visitor', message);
  }
  if (!thread) return json({ threadId: null, messages: [] });
  return json({
    threadId: thread.id,
    messages: await messages(
      env,
      thread.id,
      request.method === 'GET' ? request : undefined,
    ),
  });
}

export async function handleInbox(
  request: Request,
  env: Env,
): Promise<Response> {
  // The Worker router authenticates every /api/inbox/* request before this handler.
  const db = database(env);
  const url = new URL(request.url);
  if (url.pathname === '/api/inbox/threads' && request.method === 'GET') {
    const result = await db
      .prepare(
        `SELECT t.id, t.updated_at AS updatedAt,
      (SELECT content FROM chat_messages WHERE thread_id = t.id ORDER BY id DESC LIMIT 1) AS lastMessage
      FROM chat_threads t ORDER BY t.updated_at DESC LIMIT 100`,
      )
      .all();
    if (!result.success)
      throw new HttpError(
        503,
        'Conversations could not be loaded. Please try again.',
      );
    return json({ threads: result.results });
  }
  if (url.pathname !== '/api/inbox/messages')
    throw new HttpError(404, 'This inbox endpoint does not exist.');
  if (request.method !== 'GET' && request.method !== 'POST')
    throw new HttpError(405, 'This method is not supported.');
  const body = request.method === 'POST' ? await readJSON(request) : null;
  const threadId = body ? body.threadId : url.searchParams.get('thread');
  if (typeof threadId !== 'string' || !/^[a-f\d-]{36}$/i.test(threadId))
    throw new HttpError(400, 'Choose a valid conversation.');
  const thread = await db
    .prepare('SELECT id FROM chat_threads WHERE id = ?')
    .bind(threadId)
    .first<Thread>();
  if (!thread) throw new HttpError(404, 'This conversation was not found.');
  if (body) await append(env, thread.id, 'owner', content(body));
  return json({
    threadId: thread.id,
    messages: await messages(
      env,
      thread.id,
      request.method === 'GET' ? request : undefined,
    ),
  });
}
