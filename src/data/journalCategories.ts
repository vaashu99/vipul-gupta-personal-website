export const journalCategoryIds = [
  'thoughts-conversations',
  'life-notes',
  'what-if',
  'humour',
] as const;

export type JournalCategory = (typeof journalCategoryIds)[number];

interface JournalCategoryDefinition {
  label: string;
  description: string;
  emptyMessage: string;
}

export const journalCategoryDefinitions: Record<
  JournalCategory,
  JournalCategoryDefinition
> = {
  'thoughts-conversations': {
    label: 'Thoughts & Conversations',
    description: 'Reflections, questions, and ideas sparked by conversations.',
    emptyMessage: 'No thoughts or conversations published yet.',
  },
  'life-notes': {
    label: 'Life Notes',
    description:
      'Life lessons, personal growth, coaching-style reflections, and everyday moments worth putting into words.',
    emptyMessage: 'No life notes published yet.',
  },
  'what-if': {
    label: 'What If',
    description:
      'Imagined possibilities, speculative essays, and questions that begin with “what if”.',
    emptyMessage: 'No what-if writing published yet.',
  },
  humour: {
    label: 'Humour',
    description:
      'The lighter side of life, from playful observations to a good laugh.',
    emptyMessage: 'No humour pieces published yet.',
  },
};

export const journalCategories = journalCategoryIds.map((id) => ({
  id,
  ...journalCategoryDefinitions[id],
}));

export const journalEmptyMessages: Record<'all' | JournalCategory, string> = {
  all: 'No entries published yet.',
  'thoughts-conversations':
    journalCategoryDefinitions['thoughts-conversations'].emptyMessage,
  'life-notes': journalCategoryDefinitions['life-notes'].emptyMessage,
  'what-if': journalCategoryDefinitions['what-if'].emptyMessage,
  humour: journalCategoryDefinitions.humour.emptyMessage,
};

export const isJournalFilter = (
  value: string,
): value is 'all' | JournalCategory =>
  Object.hasOwn(journalEmptyMessages, value);
