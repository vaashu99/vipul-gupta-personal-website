import { mkdir, readFile, rmdir, unlink, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const contentDirectory = new URL('../src/content/', import.meta.url);
const marker = '<!-- Automated test fixture: never publish -->';
const createdDirectories = new Set();

// Reserved QA names are created exclusively and removed only with our marker.
// Real Tech posts are never overwritten or included in cleanup.
export const fixtureEntries = [
  {
    collection: 'journal',
    slug: 'qa-thoughts',
    title: 'QA thoughts & conversations',
    category: 'thoughts-conversations',
    date: '2022-01-01',
    draft: false,
  },
  {
    collection: 'journal',
    slug: 'qa-life-notes',
    title: 'QA life notes',
    category: 'life-notes',
    date: '2021-01-01',
    draft: false,
  },
  {
    collection: 'journal',
    slug: 'qa-what-if',
    title: 'QA what-if possibilities',
    category: 'what-if',
    date: '2020-01-01',
    draft: false,
  },
  {
    collection: 'journal',
    slug: 'qa-humour',
    title: 'QA humour',
    category: 'humour',
    date: '2019-01-01',
    draft: false,
  },
  {
    collection: 'journal',
    slug: 'qa-series/nested-entry',
    title: 'QA nested Journal article',
    category: 'life-notes',
    date: '2018-01-01',
    draft: false,
  },
  {
    collection: 'tech',
    slug: 'qa-engineering',
    title: 'QA engineering & reliability',
    category: 'engineering',
    date: '2022-01-01',
    draft: false,
  },
  {
    collection: 'tech',
    slug: 'qa-community',
    title: 'QA community article',
    category: 'community',
    date: '2021-01-01',
    draft: false,
  },
  {
    collection: 'tech',
    slug: 'qa-series/nested-entry',
    title: 'QA nested Tech article',
    category: 'learning',
    date: '2020-01-01',
    draft: false,
  },
  ...['journal', 'tech'].flatMap((collection) => [
    {
      collection,
      slug: 'qa-draft',
      title: `QA ${collection} private unfinished draft`,
      category: collection === 'journal' ? 'life-notes' : 'engineering',
      date: '2023-01-01',
      draft: true,
    },
    {
      collection,
      slug: 'qa-future',
      title: `QA ${collection} future scheduled article`,
      category: collection === 'journal' ? 'what-if' : 'learning',
      date: '2999-01-01',
      draft: false,
    },
    {
      collection,
      slug: 'qa-default-draft',
      title: `QA ${collection} unpublished by default`,
      category: collection === 'journal' ? 'humour' : 'community',
      date: '2023-01-01',
    },
  ]),
];

function markdown(entry) {
  return `---
title: ${JSON.stringify(entry.title)}
description: "An automated fixture for validating Markdown publishing and article sharing."
publishedAt: ${entry.date}
category: ${entry.category}
${entry.draft === undefined ? '' : `draft: ${entry.draft}`}
---

${marker}

## A rendered Markdown section

This is **important emphasis** in a test article, with a [reference link](https://example.com/reference).

- First list item
- Second list item

> A short test quotation.

\`\`\`text
${'LongLineWithoutSpaces'.repeat(12)}
\`\`\`

| Topic | Observation |
| --- | --- |
| Publishing | Markdown renders as an article |

This inline identifier should wrap: \`${'longidentifier'.repeat(10)}\`.
`;
}

export async function prepareFixtures() {
  const written = [];
  try {
    for (const entry of fixtureEntries) {
      const file = new URL(
        `${entry.collection}/${entry.slug}.md`,
        contentDirectory,
      );
      const created = await mkdir(new URL('.', file), { recursive: true });
      if (created) createdDirectories.add(created);
      await writeFile(file, markdown(entry), { flag: 'wx' });
      written.push(file);
    }
  } catch (error) {
    await Promise.all(written.map((file) => unlink(file)));
    throw error;
  }
}

export async function cleanupFixtures() {
  for (const entry of fixtureEntries) {
    const file = new URL(
      `${entry.collection}/${entry.slug}.md`,
      contentDirectory,
    );
    try {
      const content = await readFile(file, 'utf8');
      if (!content.includes(marker)) {
        throw new Error(
          `Refusing to remove non-fixture file: ${fileURLToPath(file)}`,
        );
      }
      await unlink(file);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  for (const created of Array.from(createdDirectories).sort(
    (a, b) => b.length - a.length,
  )) {
    try {
      await rmdir(created);
    } catch (error) {
      if (!['ENOENT', 'ENOTEMPTY'].includes(error.code)) throw error;
    }
  }
  createdDirectories.clear();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const operation = process.argv[2];
  if (operation === 'prepare') await prepareFixtures();
  else if (operation === 'cleanup') await cleanupFixtures();
  else throw new Error('Use journal-fixtures.mjs prepare or cleanup');
}
