import assert from 'node:assert/strict';
import { generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

// Real workerd/D1 integration; temporary assets and storage never touch preview data.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await mkdtemp(join(tmpdir(), 'vipul-interactions-'));
const assets = join(temporary, 'assets');
const runtimes = [];
let passed = 0;
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const { privateKey: wrongPrivateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const issuer = 'https://isolated-test.cloudflareaccess.com';
const audience = 'isolated-test-audience';
const owner = 'owner@example.test';
const jwk = {
  ...publicKey.export({ format: 'jwk' }),
  kid: 'isolated-test-key',
  use: 'sig',
  alg: 'RS256',
};

function jwt(overrides = {}, key = privateKey, headerOverrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({
      alg: 'RS256',
      kid: jwk.kid,
      typ: 'JWT',
      ...headerOverrides,
    }),
  ).toString('base64url');
  const claims = Buffer.from(
    JSON.stringify({
      iss: issuer,
      aud: [audience],
      exp: now + 300,
      nbf: now - 5,
      email: owner,
      ...overrides,
    }),
  ).toString('base64url');
  const input = `${header}.${claims}`;
  return `${input}.${sign('RSA-SHA256', Buffer.from(input), key).toString('base64url')}`;
}
async function scenario(name, run) {
  await run();
  passed += 1;
  console.log(`PASS ${name}`);
}
async function runtime(name, bindings, database = true, initialize = true) {
  const mf = new Miniflare(
    convertV4MiniflareOptions({
      name,
      rootPath: root,
      modules: [
        {
          type: 'ESModule',
          path: 'worker.mjs',
          contents: await readFile(join(temporary, 'worker.mjs'), 'utf8'),
        },
      ],
      compatibilityDate: '2026-10-04',
      host: '127.0.0.1',
      port: 0,
      inspectorPort: 0,
      resourcePersistencePath: join(temporary, name),
      assets: {
        directory: assets,
        binding: 'ASSETS',
        run_worker_first: true,
        assetConfig: { not_found_handling: '404-page' },
      },
      bindings,
      ...(database ? { d1Databases: { SITE_DB: `isolated-${name}` } } : {}),
      outboundService: async (request) => {
        assert.equal(request.url, `${issuer}/cdn-cgi/access/certs`);
        return new Response(JSON.stringify({ keys: [jwk] }), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
    }),
  );
  runtimes.push(mf);
  await mf.ready;
  if (database && initialize) {
    const db = await mf.getD1Database('SITE_DB');
    for (const filename of [
      '0001_reactions.sql',
      '0002_chat.sql',
      '0003_chat_sender_details.sql',
    ]) {
      if (name === 'local' && filename === '0003_chat_sender_details.sql') {
        await db
          .prepare('INSERT INTO chat_threads (id, visitor_key) VALUES (?, ?)')
          .bind(legacyThreadId, legacyVisitorId)
          .run();
        await db
          .prepare(
            'INSERT INTO chat_messages (thread_id, sender, content) VALUES (?, ?, ?)',
          )
          .bind(legacyThreadId, 'visitor', 'Preserved legacy message')
          .run();
      }
      const sql = (
        await readFile(join(root, 'migrations', filename), 'utf8')
      ).replace(/--[^\n]*/g, '');
      for (const statement of sql.split(';').filter((part) => part.trim()))
        await db.exec(statement.replace(/\s+/g, ' ').trim());
    }
  }
  return mf;
}
async function request(
  mf,
  path,
  {
    origin = 'http://127.0.0.1',
    cookie,
    body,
    raw,
    method = body || raw ? 'POST' : 'GET',
    headers = {},
    site,
  } = {},
) {
  const worker = await mf.getWorker();
  const result = await worker.fetch(`${origin}${path}`, {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body || raw
        ? { 'Content-Type': 'application/json', Origin: origin }
        : {}),
      ...(site ? { 'Sec-Fetch-Site': site } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : raw ? { body: raw } : {}),
  });
  const text = await result.text();
  return {
    status: result.status,
    headers: result.headers,
    text,
    body: result.headers.get('Content-Type')?.includes('application/json')
      ? JSON.parse(text)
      : null,
  };
}
const senderA = {
  name: 'Visitor Alpha',
  contactType: 'email',
  contactValue: 'alpha@example.test',
};
const senderB = {
  name: '访客 Beta',
  contactType: 'phone',
  contactValue: '+65 9123 4567',
};
const legacyVisitorId = randomUUID();
const legacyThreadId = randomUUID();
const reactionPath = '/api/reactions?article=tech/published';
const cookieFrom = (result) => result.headers.get('Set-Cookie')?.split(';')[0];
const visitorCookie = () => `vg_visitor=${randomUUID()}`;

try {
  await mkdir(assets, { recursive: true });
  for (const [path, title] of [
    ['tech/published/index.html', 'Published Tech'],
    ['journal/published/index.html', 'Published Journal'],
    ['inbox/index.html', 'Private inbox'],
    ['404.html', 'Not found'],
  ]) {
    const file = join(assets, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(
      file,
      `<!doctype html><html><head><title>${title}</title></head><body><h1>${title}</h1></body></html>`,
    );
  }
  await build({
    entryPoints: [join(root, 'workers/index.ts')],
    bundle: true,
    outfile: join(temporary, 'worker.mjs'),
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
  });
  const local = await runtime('local', { LOCAL_OWNER_PREVIEW: 'true' });
  const production = await runtime('production', {
    LOCAL_OWNER_PREVIEW: 'true',
    CF_ACCESS_TEAM_DOMAIN: 'isolated-test.cloudflareaccess.com',
    CF_ACCESS_AUD: audience,
    OWNER_EMAIL: owner,
  });
  const closed = await runtime('closed', { OWNER_EMAIL: 'any' });
  const unconfigured = await runtime('unconfigured', {}, false);
  const visitorA = visitorCookie();
  const visitorB = visitorCookie();
  let threadA;

  await scenario(
    'anonymous cookie is HttpOnly, SameSite, scoped and secure on HTTPS',
    async () => {
      const result = await request(local, reactionPath, {
        origin: 'https://example.test',
      });
      assert.equal(result.status, 200, result.text);
      const cookie = result.headers.get('Set-Cookie');
      assert.match(cookie, /^vg_visitor=[a-f\d-]{36};/);
      for (const flag of ['HttpOnly', 'SameSite=Lax', 'Path=/api', 'Secure'])
        assert.ok(cookie.includes(flag));
      assert.match(result.headers.get('Cache-Control'), /no-store/);
      assert.equal(result.headers.get('Access-Control-Allow-Origin'), null);
      assert.ok(cookieFrom(result));
    },
  );
  await scenario(
    'shared reaction counts and private selection persist across browsers',
    async () => {
      let result = await request(local, reactionPath, {
        cookie: visitorA,
        body: { article: 'tech/published', reaction: 'like' },
      });
      assert.equal(result.status, 200, result.text);
      assert.deepEqual(result.body, {
        counts: { like: 1, helpful: 0, insightful: 0 },
        selected: 'like',
      });
      result = await request(local, reactionPath, { cookie: visitorB });
      assert.equal(result.body.counts.like, 1);
      assert.equal(result.body.selected, null);
      result = await request(local, reactionPath, { cookie: visitorA });
      assert.equal(result.body.selected, 'like');
    },
  );
  await scenario(
    'changing and toggling reactions preserves one row per visitor',
    async () => {
      await request(local, reactionPath, {
        cookie: visitorB,
        body: { article: 'tech/published', reaction: 'like' },
      });
      const changed = await request(local, reactionPath, {
        cookie: visitorA,
        body: { article: 'tech/published', reaction: 'helpful' },
      });
      assert.deepEqual(changed.body.counts, {
        like: 1,
        helpful: 1,
        insightful: 0,
      });
      const removed = await request(local, reactionPath, {
        cookie: visitorA,
        body: { article: 'tech/published', reaction: null },
      });
      assert.deepEqual(removed.body, {
        counts: { like: 1, helpful: 0, insightful: 0 },
        selected: null,
      });
    },
  );
  await scenario(
    'Journal reactions are stored independently of Tech',
    async () => {
      const result = await request(
        local,
        '/api/reactions?article=journal/published',
        {
          cookie: visitorA,
          body: { article: 'journal/published', reaction: 'insightful' },
        },
      );
      assert.equal(result.status, 200, result.text);
      assert.deepEqual(result.body.counts, {
        like: 0,
        helpful: 0,
        insightful: 1,
      });
      assert.equal(
        (await request(local, reactionPath, { cookie: visitorA })).body.counts
          .insightful,
        0,
      );
    },
  );
  await scenario(
    'invalid, draft, future and missing article routes reject reactions',
    async () => {
      for (const article of [
        'tech/draft',
        'tech/future',
        'journal/missing',
        'tech/../../inbox',
        'home',
        'tech/' + 'x'.repeat(201),
      ]) {
        const result = await request(
          local,
          `/api/reactions?article=${encodeURIComponent(article)}`,
          { cookie: visitorA },
        );
        assert.ok(
          [400, 404].includes(result.status),
          `${article}: ${result.status}`,
        );
      }
      assert.equal(
        (
          await request(local, reactionPath, {
            cookie: visitorA,
            body: { article: 'tech/published', reaction: 'evil' },
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await request(local, reactionPath, {
            cookie: visitorA,
            body: { article: 'journal/published', reaction: 'like' },
          })
        ).status,
        400,
      );
    },
  );
  await scenario(
    'cross-origin writes and absent Origin are rejected',
    async () => {
      for (const path of [reactionPath, '/api/chat', '/api/inbox/messages']) {
        assert.equal(
          (
            await request(local, path, {
              cookie: visitorA,
              body: {
                message: 'blocked',
                article: 'tech/published',
                reaction: 'like',
              },
              headers: { Origin: 'https://attacker.example' },
            })
          ).status,
          403,
        );
        assert.equal(
          (
            await request(local, path, {
              cookie: visitorA,
              body: { message: 'blocked' },
              headers: { Origin: '' },
            })
          ).status,
          403,
        );
      }
      assert.equal(
        (
          await request(local, '/api/chat', {
            body: { message: 'blocked' },
            site: 'cross-site',
          })
        ).status,
        403,
      );
    },
  );
  await scenario(
    'chat creates cookie-scoped conversations and preserves message text',
    async () => {
      const before = await request(local, '/api/chat', { cookie: visitorA });
      assert.deepEqual(before.body, {
        threadId: null,
        sender: null,
        messages: [],
      });
      const content = '<script>alert("xss")</script> Hello & welcome';
      const result = await request(local, '/api/chat', {
        cookie: visitorA,
        body: { message: content, threadId: 'ignored', sender: senderA },
      });
      assert.equal(result.status, 200, result.text);
      threadA = result.body.threadId;
      assert.match(threadA, /^[a-f\d-]{36}$/);
      assert.equal(result.body.messages[0].content, content);
      assert.equal(result.body.messages[0].sender, 'visitor');
      assert.deepEqual(result.body.sender, senderA);
      assert.equal(typeof result.body.messages[0].id, 'number');
      assert.equal(
        result.headers.get('Content-Type'),
        'application/json; charset=utf-8',
      );
    },
  );
  await scenario(
    'visitors cannot read or target another conversation',
    async () => {
      const empty = await request(local, `/api/chat?thread=${threadA}`, {
        cookie: visitorB,
      });
      assert.deepEqual(empty.body, {
        threadId: null,
        sender: null,
        messages: [],
      });
      const result = await request(local, '/api/chat', {
        cookie: visitorB,
        body: { message: 'Browser B only', threadId: threadA, sender: senderB },
      });
      assert.notEqual(result.body.threadId, threadA);
      assert.deepEqual(result.body.sender, senderB);
      assert.ok(!JSON.stringify(result.body).includes(senderA.contactValue));
      const readA = await request(local, '/api/chat', { cookie: visitorA });
      assert.equal(readA.body.messages.length, 1);
      assert.deepEqual(readA.body.sender, senderA);
      assert.ok(!JSON.stringify(readA.body).includes(senderB.contactValue));
      assert.ok(!JSON.stringify(readA.body).includes('Browser B only'));
    },
  );
  await scenario(
    'owner replies appear only in the matching visitor conversation',
    async () => {
      const threads = await request(local, '/api/inbox/threads');
      assert.equal(threads.status, 200);
      assert.equal(threads.body.threads.length, 3);
      assert.deepEqual(
        threads.body.threads.find((thread) => thread.id === threadA).sender,
        senderA,
      );
      const reply = await request(local, '/api/inbox/messages', {
        body: { threadId: threadA, message: 'Thanks for reaching out.' },
      });
      assert.equal(reply.status, 200);
      assert.equal(reply.body.messages.at(-1).sender, 'owner');
      assert.deepEqual(reply.body.sender, senderA);
      assert.equal(
        (
          await request(local, '/api/chat', { cookie: visitorA })
        ).body.messages.at(-1).content,
        'Thanks for reaching out.',
      );
      assert.ok(
        !JSON.stringify(
          (await request(local, '/api/chat', { cookie: visitorB })).body,
        ).includes('Thanks for reaching out.'),
      );
      const cursor = reply.body.messages.at(-1).id;
      assert.deepEqual(
        (
          await request(local, `/api/chat?after=${cursor}`, {
            cookie: visitorA,
          })
        ).body.messages,
        [],
      );
      assert.equal(
        (await request(local, '/api/chat?after=nope', { cookie: visitorA }))
          .status,
        400,
      );
    },
  );
  await scenario(
    'malformed and oversized chat input fails without saving',
    async () => {
      for (const message of ['', '  ', 'x'.repeat(2001), 17])
        assert.equal(
          (
            await request(local, '/api/chat', {
              cookie: visitorA,
              body: { message },
            })
          ).status,
          400,
        );
      assert.equal(
        (
          await request(local, '/api/chat', {
            cookie: visitorA,
            raw: '{broken',
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await request(local, '/api/chat', {
            cookie: visitorA,
            raw: JSON.stringify({ message: 'x'.repeat(11000) }),
          })
        ).status,
        413,
      );
      assert.equal(
        (
          await request(local, '/api/chat', {
            cookie: visitorA,
            body: { message: 'plain' },
            headers: { 'Content-Type': 'text/plain' },
          })
        ).status,
        415,
      );
      assert.equal(
        (await request(local, '/api/chat', { cookie: visitorA })).body.messages
          .length,
        2,
      );
    },
  );
  await scenario(
    'private inbox and normalized aliases fail closed with missing owner configuration',
    async () => {
      for (const path of [
        '/inbox',
        '/inbox/',
        '/inbox.html',
        '/inbox/index.html',
        '/%69nbox/',
        '/inbox%2findex.html',
        '/other/%2e%2e/inbox/',
        '/api/inbox/threads',
        '/api/%69nbox/threads',
      ]) {
        const result = await request(closed, path);
        assert.equal(result.status, 503, `${path}: ${result.status}`);
        assert.match(result.headers.get('Cache-Control'), /no-store/);
        assert.ok(!result.text.includes('<h1>Private inbox'));
      }
    },
  );
  await scenario(
    'local owner preview cannot bypass HTTPS or non-loopback access',
    async () => {
      for (const origin of [
        'https://127.0.0.1',
        'http://example.test',
        'https://example.test',
      ]) {
        assert.equal(
          (await request(production, '/api/inbox/threads', { origin })).status,
          401,
        );
      }
      assert.equal((await request(local, '/inbox/')).status, 200);
    },
  );
  await scenario(
    'verified signed Access JWT grants exact owner access',
    async () => {
      const result = await request(production, '/api/inbox/threads', {
        origin: 'https://example.test',
        headers: { 'Cf-Access-Jwt-Assertion': jwt() },
      });
      assert.equal(result.status, 200, result.text);
      assert.deepEqual(result.body, { threads: [] });
    },
  );
  await scenario(
    'JWT signature, issuer, audience, expiry, not-before and owner email are enforced',
    async () => {
      const now = Math.floor(Date.now() / 1000);
      const rejected = [
        jwt({}, wrongPrivateKey),
        jwt({ iss: 'https://evil.example' }),
        jwt({ aud: ['other'] }),
        jwt({ exp: now - 1 }),
        jwt({ nbf: now + 300 }),
        jwt({ email: 'other@example.test' }),
        jwt({ email: 'owner@example.test.attacker' }),
        jwt({ exp: 'future' }),
        jwt({}, privateKey, { alg: 'HS256' }),
        jwt({}, privateKey, { crit: ['unsupported'] }),
        'invalid.token.input',
      ];
      for (const token of rejected)
        assert.equal(
          (
            await request(production, '/api/inbox/threads', {
              origin: 'https://example.test',
              headers: { 'Cf-Access-Jwt-Assertion': token },
            })
          ).status,
          403,
        );
    },
  );
  await scenario(
    'missing backend never pretends to persist reactions or messages',
    async () => {
      assert.equal((await request(unconfigured, reactionPath)).status, 503);
      assert.equal((await request(unconfigured, '/api/chat')).status, 503);
      assert.equal(
        (
          await request(unconfigured, '/api/chat', {
            body: { message: 'Not saved' },
          })
        ).status,
        503,
      );
    },
  );
  await scenario('chat burst protection rejects repeated sends', async () => {
    const cookie = visitorCookie();
    for (let i = 0; i < 5; i++)
      assert.equal(
        (
          await request(local, '/api/chat', {
            cookie,
            body: { message: `Burst ${i}`, sender: senderA },
          })
        ).status,
        200,
      );
    assert.equal(
      (
        await request(local, '/api/chat', {
          cookie,
          body: { message: 'Too many' },
        })
      ).status,
      429,
    );
  });
  await scenario(
    'concurrent first chat sends create exactly one conversation',
    async () => {
      const cookie = visitorCookie();
      const replies = await Promise.all(
        ['First parallel message', 'Second parallel message'].map((message) =>
          request(local, '/api/chat', {
            cookie,
            body: { message, sender: senderA },
          }),
        ),
      );
      assert.ok(replies.every((reply) => reply.status === 200));
      assert.equal(replies[0].body.threadId, replies[1].body.threadId);
      const loaded = await request(local, '/api/chat', { cookie });
      assert.equal(loaded.body.messages.length, 2);
      assert.deepEqual(
        new Set(loaded.body.messages.map((message) => message.content)),
        new Set(['First parallel message', 'Second parallel message']),
      );
    },
  );
  await scenario(
    'chat history is bounded and cursor reads retain chronological ordering',
    async () => {
      const cookie = visitorCookie();
      const created = await request(local, '/api/chat', {
        cookie,
        body: { message: 'Initial history message', sender: senderA },
      });
      const db = await local.getD1Database('SITE_DB');
      await db.batch(
        Array.from({ length: 105 }, (_, index) =>
          db
            .prepare(
              'INSERT INTO chat_messages (thread_id, sender, content) VALUES (?, ?, ?)',
            )
            .bind(created.body.threadId, 'owner', `History ${index}`),
        ),
      );
      const latest = await request(local, '/api/chat', { cookie });
      assert.equal(latest.body.messages.length, 100);
      assert.equal(latest.body.messages.at(-1).content, 'History 104');
      assert.ok(
        latest.body.messages.every(
          (message, index, all) =>
            index === 0 || message.id > all[index - 1].id,
        ),
      );
      const cursor = await request(
        local,
        `/api/chat?after=${created.body.messages[0].id}`,
        { cookie },
      );
      assert.equal(cursor.body.messages.length, 100);
      assert.equal(cursor.body.messages[0].content, 'History 0');
      assert.equal(cursor.body.messages.at(-1).content, 'History 99');
    },
  );
  await scenario(
    'uninitialized D1 returns service errors rather than fake success',
    async () => {
      const broken = await runtime(
        'uninitialized',
        { LOCAL_OWNER_PREVIEW: 'true' },
        true,
        false,
      );
      for (const path of [reactionPath, '/api/chat', '/api/inbox/threads']) {
        const response = await request(broken, path);
        assert.equal(response.status, 503);
        assert.ok(!response.text.includes('SQLITE'));
      }
      assert.equal(
        (
          await request(broken, '/api/chat', {
            body: { message: 'Must not succeed' },
          })
        ).status,
        503,
      );
    },
  );
  await scenario(
    'additive sender migration preserves unidentified legacy conversations',
    async () => {
      const cookie = `vg_visitor=${legacyVisitorId}`;
      const legacy = await request(local, '/api/chat', { cookie });
      assert.equal(legacy.status, 200);
      assert.equal(legacy.body.threadId, legacyThreadId);
      assert.equal(legacy.body.sender, null);
      assert.equal(legacy.body.messages.length, 1);
      assert.equal(legacy.body.messages[0].content, 'Preserved legacy message');
      const inbox = await request(
        local,
        `/api/inbox/messages?thread=${legacyThreadId}`,
      );
      assert.equal(inbox.body.sender, null);
      const denied = await request(local, '/api/chat', {
        cookie,
        body: { message: 'Missing sender' },
      });
      assert.equal(denied.status, 400);
      const identified = await request(local, '/api/chat', {
        cookie,
        body: { message: 'New identified message', sender: senderB },
      });
      assert.equal(identified.status, 200, identified.text);
      assert.equal(identified.body.threadId, legacyThreadId);
      assert.deepEqual(identified.body.sender, senderB);
      assert.equal(identified.body.messages.length, 2);
      assert.equal(
        identified.body.messages[0].content,
        'Preserved legacy message',
      );
    },
  );
  await scenario(
    'new conversations require complete valid sender details without creating rejected threads',
    async () => {
      const invalid = [
        undefined,
        null,
        [],
        {},
        { ...senderA, name: '' },
        { ...senderA, name: 'x'.repeat(101) },
        { ...senderA, name: 'Bad\u0000Name' },
        { ...senderA, name: 'Bad\u0085Name' },
        { ...senderA, name: 'Bad\u202eName' },
        { ...senderA, contactType: 'fax' },
        { ...senderA, contactValue: '' },
        { ...senderA, contactValue: 'missing-domain' },
        { ...senderA, contactValue: 'bad@example' },
        { ...senderA, contactValue: 'bad@@example.test' },
        { ...senderA, contactValue: '<bad>@example.test' },
        { ...senderA, contactValue: 'x'.repeat(250) + '@example.test' },
        {
          ...senderA,
          contactValue: 'bad@example.test\r\nBcc: attacker@example.test',
        },
        { ...senderB, contactValue: '123456' },
        { ...senderB, contactValue: '1'.repeat(21) },
        { ...senderB, contactValue: '+65 call now' },
        { ...senderB, contactValue: '+65\u202e91234567' },
        { ...senderB, contactValue: '+65' + ' '.repeat(51) + '91234567' },
      ];
      for (const sender of invalid) {
        const cookie = visitorCookie();
        const denied = await request(local, '/api/chat', {
          cookie,
          body: {
            message: 'Rejected message',
            ...(sender === undefined ? {} : { sender }),
          },
        });
        assert.equal(denied.status, 400);
        assert.deepEqual((await request(local, '/api/chat', { cookie })).body, {
          threadId: null,
          sender: null,
          messages: [],
        });
      }
    },
  );
  await scenario(
    'identified senders reuse saved contact details and can update their own profile',
    async () => {
      const cookie = visitorCookie();
      const initial = await request(local, '/api/chat', {
        cookie,
        body: {
          message: 'Initial profile',
          sender: {
            ...senderA,
            name: '  Δοκιμή 访客  ',
            contactValue: '  alpha@example.test  ',
          },
        },
      });
      assert.equal(initial.status, 200, initial.text);
      const stored = { ...senderA, name: 'Δοκιμή 访客' };
      assert.deepEqual(initial.body.sender, stored);
      const reused = await request(local, '/api/chat', {
        cookie,
        body: { message: 'Reuse profile' },
      });
      assert.equal(reused.status, 200);
      assert.deepEqual(reused.body.sender, stored);
      const updated = await request(local, '/api/chat', {
        cookie,
        body: { message: 'Update contact', sender: senderB },
      });
      assert.equal(updated.status, 200);
      assert.deepEqual(updated.body.sender, senderB);
      const inbox = await request(
        local,
        `/api/inbox/messages?thread=${initial.body.threadId}`,
      );
      assert.deepEqual(inbox.body.sender, senderB);
      const list = await request(local, '/api/inbox/threads');
      assert.deepEqual(
        list.body.threads.find((thread) => thread.id === initial.body.threadId)
          .sender,
        senderB,
      );
    },
  );
  await scenario(
    'invalid messages or sender updates preserve existing profile and history',
    async () => {
      const cookie = visitorCookie();
      const initial = await request(local, '/api/chat', {
        cookie,
        body: { message: 'Preserved profile', sender: senderA },
      });
      for (const body of [
        { message: '', sender: senderB },
        {
          message: 'No update',
          sender: { ...senderB, contactValue: 'invalid' },
        },
        { message: 'x'.repeat(2001), sender: senderB },
      ]) {
        assert.equal(
          (await request(local, '/api/chat', { cookie, body })).status,
          400,
        );
        const unchanged = await request(local, '/api/chat', { cookie });
        assert.deepEqual(unchanged.body.sender, senderA);
        assert.deepEqual(unchanged.body.messages, initial.body.messages);
      }
    },
  );
  await scenario(
    'message storage failure rolls back both new and existing sender details',
    async () => {
      const existingCookie = visitorCookie();
      const newCookie = visitorCookie();
      const initial = await request(local, '/api/chat', {
        cookie: existingCookie,
        body: { message: 'Transactional original', sender: senderA },
      });
      const db = await local.getD1Database('SITE_DB');
      await db.exec(
        "CREATE TRIGGER reject_fixture_message BEFORE INSERT ON chat_messages WHEN NEW.content = 'Reject transactional fixture' BEGIN SELECT RAISE(ABORT, 'isolated fixture rejection'); END;",
      );
      try {
        for (const cookie of [existingCookie, newCookie])
          assert.equal(
            (
              await request(local, '/api/chat', {
                cookie,
                body: {
                  message: 'Reject transactional fixture',
                  sender: senderB,
                },
              })
            ).status,
            503,
          );
        const unchanged = await request(local, '/api/chat', {
          cookie: existingCookie,
        });
        assert.deepEqual(unchanged.body.sender, senderA);
        assert.deepEqual(unchanged.body.messages, initial.body.messages);
        assert.deepEqual(
          (await request(local, '/api/chat', { cookie: newCookie })).body,
          { threadId: null, sender: null, messages: [] },
        );
      } finally {
        await db.exec('DROP TRIGGER reject_fixture_message;');
      }
    },
  );
  await scenario(
    'sender contacts stay out of reactions, public assets and other visitor responses',
    async () => {
      const stranger = visitorCookie();
      const responses = [
        await request(local, reactionPath, { cookie: visitorA }),
        await request(local, '/api/chat', { cookie: stranger }),
        await request(local, '/tech/published/'),
        await request(local, '/api/health'),
      ];
      for (const response of responses) {
        assert.equal(response.status, 200);
        assert.ok(!response.text.includes(senderA.contactValue));
        assert.ok(!response.text.includes(senderB.contactValue));
        if (response.headers.get('Set-Cookie'))
          assert.ok(!response.headers.get('Set-Cookie').includes('@'));
      }
      assert.equal(responses[0].body.sender, undefined);
      const inaccessible = await request(
        closed,
        `/api/inbox/messages?thread=${threadA}`,
      );
      assert.equal(inaccessible.status, 503);
      assert.ok(!inaccessible.text.includes(senderA.contactValue));
    },
  );
  console.log(
    `${passed} backend integration scenarios passed (isolated real D1 / workerd).`,
  );
} finally {
  await Promise.allSettled(runtimes.map((mf) => mf.dispose()));
  await rm(temporary, { recursive: true, force: true });
}
