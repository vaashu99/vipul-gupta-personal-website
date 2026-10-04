import {
  HttpError,
  checkBurst,
  json,
  readJSON,
  type Env,
  type Visitor,
} from './shared';

export const REACTIONS = ['like', 'helpful', 'insightful'] as const;
type Reaction = (typeof REACTIONS)[number];
const publishedArticles = new Map<string, number>();

async function requirePublishedArticle(
  request: Request,
  env: Env,
  article: unknown,
): Promise<string> {
  if (
    typeof article !== 'string' ||
    article.length > 200 ||
    !/^(?:tech|journal)\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(
      article,
    )
  ) {
    throw new HttpError(400, 'Choose a published article to react to.');
  }
  const url = new URL(request.url);
  const cacheKey = `${url.origin}/${article}`;
  const now = Date.now();
  if ((publishedArticles.get(cacheKey) ?? 0) > now) return article;
  // Static build routes are the publication gate, including draft/future filtering.
  const assetURL = new URL(`/${article}/`, url.origin);
  const response = await env.ASSETS.fetch(
    new Request(assetURL, { method: 'HEAD' }),
  );
  if (
    response.status !== 200 ||
    !response.headers.get('Content-Type')?.includes('text/html')
  ) {
    throw new HttpError(404, 'This published article could not be found.');
  }
  for (const [key, expiry] of publishedArticles)
    if (expiry <= now) publishedArticles.delete(key);
  if (publishedArticles.size >= 256)
    publishedArticles.delete(publishedArticles.keys().next().value!);
  publishedArticles.set(cacheKey, now + 120_000);
  return article;
}

export async function handleReactions(
  request: Request,
  env: Env,
  visitor: Visitor,
): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'POST')
    return json({ message: 'Use GET or POST for reactions.' }, 405, {
      Allow: 'GET, POST',
    });
  if (!env.SITE_DB)
    throw new HttpError(
      503,
      'Shared reactions are not available yet. Please try again later.',
    );
  const queryArticle = new URL(request.url).searchParams.get('article');
  let article: string;
  if (request.method === 'POST') {
    const body = await readJSON(request);
    if (queryArticle && body.article !== queryArticle)
      throw new HttpError(400, 'The article does not match this request.');
    article = await requirePublishedArticle(request, env, body.article);
    const reaction = body.reaction;
    if (reaction !== null && !REACTIONS.includes(reaction as Reaction))
      throw new HttpError(400, 'Choose Like, Helpful or Insightful.');
    await checkBurst(request, visitor, 'reactions', 20, 60_000);
    if (reaction === null) {
      const write = await env.SITE_DB.prepare(
        'DELETE FROM article_reactions WHERE article = ? AND visitor_id = ?',
      )
        .bind(article, visitor.id)
        .run();
      if (!write.success)
        throw new HttpError(
          503,
          'Your reaction could not be saved. Please try again.',
        );
    } else {
      const write = await env.SITE_DB.prepare(
        'INSERT INTO article_reactions (article, visitor_id, reaction, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(article, visitor_id) DO UPDATE SET reaction = excluded.reaction, updated_at = excluded.updated_at',
      )
        .bind(article, visitor.id, reaction, new Date().toISOString())
        .run();
      if (!write.success)
        throw new HttpError(
          503,
          'Your reaction could not be saved. Please try again.',
        );
    }
  } else {
    article = await requirePublishedArticle(request, env, queryArticle);
  }
  const results = await env.SITE_DB.batch([
    env.SITE_DB.prepare(
      'SELECT reaction, COUNT(*) AS count FROM article_reactions WHERE article = ? GROUP BY reaction',
    ).bind(article),
    env.SITE_DB.prepare(
      'SELECT reaction FROM article_reactions WHERE article = ? AND visitor_id = ?',
    ).bind(article, visitor.id),
  ]);
  if (results.some((result) => !result.success))
    throw new HttpError(
      503,
      'Shared reactions are temporarily unavailable. Please try again later.',
    );
  const counts = { like: 0, helpful: 0, insightful: 0 };
  for (const row of results[0].results) {
    if (REACTIONS.includes(row.reaction as Reaction))
      counts[row.reaction as Reaction] = Number(row.count);
  }
  const selected = results[1].results[0]?.reaction ?? null;
  return json({ counts, selected });
}
