import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const escapeXML = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (character) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[character] ?? character,
  );

export const GET: APIRoute = async ({ site }) => {
  const paths = [
    '',
    'experience/',
    'tech/',
    'about/',
    'journal/',
    'my-space/',
    'photos/',
    'chat/',
  ];
  const now = Date.now();
  const entries = await getCollection(
    'journal',
    ({ data }) => !data.draft && data.publishedAt.getTime() <= now,
  );
  paths.push(
    ...entries.map(
      (entry) =>
        `journal/${entry.id.split('/').map(encodeURIComponent).join('/')}/`,
    ),
  );
  const techEntries = await getCollection(
    'tech',
    ({ data }) => !data.draft && data.publishedAt.getTime() <= now,
  );
  paths.push(
    ...techEntries.map(
      (entry) =>
        `tech/${entry.id.split('/').map(encodeURIComponent).join('/')}/`,
    ),
  );
  const origin = site ?? new URL('https://vipulgupta.tech');
  const urls = paths
    .map(
      (path) =>
        `<url><loc>${escapeXML(new URL(path, origin).href)}</loc></url>`,
    )
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
