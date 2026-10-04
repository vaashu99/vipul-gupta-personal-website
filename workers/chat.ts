import {
  checkBurst,
  HttpError,
  json,
  readJSON,
  type Env,
  type Visitor,
} from './shared';

type Sender = {
  name: string;
  contactType: 'email' | 'phone';
  contactValue: string;
};
type Thread = {
  id: string;
  senderName: string | null;
  senderContactType: 'email' | 'phone' | null;
  senderContactValue: string | null;
};
type InboxThread = Thread & {
  updatedAt: string;
  lastMessage: string | null;
};
type Message = {
  id: number;
  sender: 'visitor' | 'owner';
  content: string;
  createdAt: string;
};

const messageColumns = 'id, sender, content, created_at AS createdAt';
const threadColumns =
  'id, sender_name AS senderName, sender_contact_type AS senderContactType, sender_contact_value AS senderContactValue';

function savedSender(thread: Thread): Sender | null {
  if (
    !thread.senderName ||
    !thread.senderContactValue ||
    (thread.senderContactType !== 'email' &&
      thread.senderContactType !== 'phone')
  )
    return null;
  return {
    name: thread.senderName,
    contactType: thread.senderContactType,
    contactValue: thread.senderContactValue,
  };
}

/** Contact details are self-reported and are never an authorization credential. */
function senderDetails(value: unknown): Sender {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new HttpError(
      400,
      'Enter your name and either an email address or phone number.',
    );
  const details = value as Record<string, unknown>;
  if (typeof details.name !== 'string')
    throw new HttpError(400, 'Enter your name.');
  const name = details.name.trim();
  if (
    !name ||
    name.length > 100 ||
    /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/.test(name)
  )
    throw new HttpError(
      400,
      'Enter a name between 1 and 100 characters without control characters.',
    );
  const contactType = details.contactType;
  if (contactType !== 'email' && contactType !== 'phone')
    throw new HttpError(400, 'Choose email or phone as your contact method.');
  if (typeof details.contactValue !== 'string')
    throw new HttpError(400, 'Enter your contact details.');
  const contactValue = details.contactValue.trim();
  if (
    /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/.test(contactValue)
  )
    throw new HttpError(
      400,
      'Enter contact details without control characters.',
    );
  if (contactType === 'email') {
    if (
      contactValue.length > 254 ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(contactValue)
    )
      throw new HttpError(
        400,
        'Enter a valid email address of up to 254 characters.',
      );
  } else {
    const digits = contactValue.replace(/\D/g, '');
    if (
      contactValue.length > 50 ||
      !/^[+]?\d[\d\s().-]*$/.test(contactValue) ||
      digits.length < 7 ||
      digits.length > 20
    )
      throw new HttpError(
        400,
        'Enter a phone number with 7 to 20 digits. Spaces, brackets, dots and hyphens are allowed.',
      );
  }
  return { name, contactType, contactValue };
}

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

async function appendVisitor(
  env: Env,
  visitor: Visitor,
  message: string,
  details: Sender,
) {
  const db = database(env);
  // D1 batches are atomic. Creation, contact updates and the message roll back together.
  // Looking up the thread inside SQL preserves the UNIQUE visitor_key race protection.
  const result = await db.batch([
    db
      .prepare(
        'INSERT OR IGNORE INTO chat_threads (id, visitor_key) VALUES (?, ?)',
      )
      .bind(crypto.randomUUID(), visitor.id),
    db
      .prepare(
        "UPDATE chat_threads SET sender_name = ?, sender_contact_type = ?, sender_contact_value = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE visitor_key = ?",
      )
      .bind(
        details.name,
        details.contactType,
        details.contactValue,
        visitor.id,
      ),
    db
      .prepare(
        "INSERT INTO chat_messages (thread_id, sender, content) SELECT id, 'visitor', ? FROM chat_threads WHERE visitor_key = ?",
      )
      .bind(message, visitor.id),
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
    .prepare(`SELECT ${threadColumns} FROM chat_threads WHERE visitor_key = ?`)
    .bind(visitor.id)
    .first<Thread>();
  if (request.method === 'POST') {
    const body = await readJSON(request);
    const message = content(body);
    const details =
      body.sender === undefined
        ? thread
          ? savedSender(thread)
          : null
        : senderDetails(body.sender);
    if (!details)
      throw new HttpError(
        400,
        'Enter your name and either an email address or phone number before sending a message.',
      );
    await checkBurst(request, visitor, 'chat-send', 5, 60000);
    await appendVisitor(env, visitor, message, details);
    thread = await db
      .prepare(
        `SELECT ${threadColumns} FROM chat_threads WHERE visitor_key = ?`,
      )
      .bind(visitor.id)
      .first<Thread>();
    if (!thread)
      throw new HttpError(
        503,
        'Your conversation could not be loaded. Please try again.',
      );
  }
  if (!thread) return json({ threadId: null, sender: null, messages: [] });
  return json({
    threadId: thread.id,
    sender: savedSender(thread),
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
        `SELECT t.id, t.sender_name AS senderName, t.sender_contact_type AS senderContactType, t.sender_contact_value AS senderContactValue, t.updated_at AS updatedAt,
      (SELECT content FROM chat_messages WHERE thread_id = t.id ORDER BY id DESC LIMIT 1) AS lastMessage
      FROM chat_threads t ORDER BY t.updated_at DESC LIMIT 100`,
      )
      .all<InboxThread>();
    if (!result.success)
      throw new HttpError(
        503,
        'Conversations could not be loaded. Please try again.',
      );
    return json({
      threads: result.results.map((thread) => ({
        id: thread.id,
        updatedAt: thread.updatedAt,
        lastMessage: thread.lastMessage,
        sender: savedSender(thread),
      })),
    });
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
    .prepare(`SELECT ${threadColumns} FROM chat_threads WHERE id = ?`)
    .bind(threadId)
    .first<Thread>();
  if (!thread) throw new HttpError(404, 'This conversation was not found.');
  if (body) await append(env, thread.id, 'owner', content(body));
  return json({
    threadId: thread.id,
    sender: savedSender(thread),
    messages: await messages(
      env,
      thread.id,
      request.method === 'GET' ? request : undefined,
    ),
  });
}
