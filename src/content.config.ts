import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { journalCategoryIds } from './data/journalCategories';

const articleFields = {
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).max(240),
  publishedAt: z.coerce.date(),
  draft: z.boolean().default(true),
  coverImage: z
    .string()
    .regex(
      /^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:avif|webp|png|jpe?g|gif|svg)$/,
      'Use a local public image path, for example /images/my-photo.webp',
    )
    .optional(),
  coverAlt: z.string().trim().min(1).optional(),
};

const articleLoader = (collection: 'journal' | 'tech') =>
  glob({
    // README contains authoring documentation and is never an article.
    pattern: ['**/*.md', '!**/README.md'],
    base: `./src/content/${collection}`,
    generateId: ({ entry }) => {
      const id = entry.replace(/\.md$/, '');
      if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(id)
      ) {
        throw new Error(
          `Article filename must use lowercase hyphenated words: ${entry}`,
        );
      }
      return id;
    },
  });

const requireCoverAlt = (
  data: { coverImage?: string; coverAlt?: string },
  context: z.RefinementCtx,
) => {
  if (data.coverImage && !data.coverAlt) {
    context.addIssue({
      code: 'custom',
      path: ['coverAlt'],
      message:
        'Provide an accurate, nonempty coverAlt when coverImage is supplied.',
    });
  }
};

const journal = defineCollection({
  loader: articleLoader('journal'),
  schema: z
    .object({
      ...articleFields,
      category: z.enum(journalCategoryIds),
    })
    .superRefine(requireCoverAlt),
});

const tech = defineCollection({
  loader: articleLoader('tech'),
  schema: z
    .object({
      ...articleFields,
      category: z.enum(['engineering', 'community', 'learning']),
    })
    .superRefine(requireCoverAlt),
});

export const collections = { journal, tech };
