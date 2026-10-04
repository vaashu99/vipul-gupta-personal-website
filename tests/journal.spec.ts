import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const articlePath = '/journal/qa-thoughts/';
const canonical = `https://vipulgupta.tech${articlePath}`;
const title = 'QA thoughts & conversations';
const description =
  'An automated fixture for validating Markdown publishing and article sharing.';

async function mockShare(
  page: Page,
  mode: 'success' | 'cancel' | 'error' | 'unavailable',
) {
  await page.addInitScript((state) => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value:
        state === 'unavailable'
          ? undefined
          : async (data: ShareData) => {
              (window as unknown as { sharePayload: ShareData }).sharePayload =
                data;
              if (state === 'cancel')
                throw new DOMException('Cancelled', 'AbortError');
              if (state === 'error')
                throw new Error('Device sharing unavailable');
            },
    });
  }, mode);
}

async function mockClipboard(
  page: Page,
  mode: 'success' | 'denied' | 'unavailable',
) {
  await page.addInitScript((state) => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value:
        state === 'unavailable'
          ? undefined
          : {
              writeText: async (text: string) => {
                if (state === 'denied')
                  throw new DOMException(
                    'Permission denied',
                    'NotAllowedError',
                  );
                (window as unknown as { copiedURL: string }).copiedURL = text;
              },
            },
    });
  }, mode);
}

for (const collection of ['journal', 'tech'] as const) {
  const route =
    collection === 'journal' ? articlePath : '/tech/qa-engineering/';
  const articleTitle =
    collection === 'journal' ? title : 'QA engineering & reliability';
  test(`${collection} Markdown becomes a readable article with production metadata`, async ({
    page,
  }, testInfo) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(articleTitle);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://vipulgupta.tech${route}`,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      description,
    );
    await expect(
      page.getByRole('heading', { name: 'A rendered Markdown section' }),
    ).toBeVisible();
    await expect(page.locator('main strong')).toContainText(
      'important emphasis',
    );
    await expect(page.locator('main blockquote')).toContainText(
      'A short test quotation.',
    );
    await expect(page.locator('main pre code')).toContainText(
      'LongLineWithoutSpaces',
    );
    await expect(page.locator('main table')).toContainText(
      'Markdown renders as an article',
    );
    await expect(
      page.getByRole('link', { name: 'reference link' }),
    ).toHaveAttribute('href', 'https://example.com/reference');
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'article',
    );
    await expect(
      page.locator('meta[property="article:published_time"]'),
    ).toHaveAttribute('content', '2022-01-01T00:00:00.000Z');
    await expect(
      page.locator('header nav a[aria-current="page"]'),
    ).toContainText(collection === 'journal' ? 'Journal' : 'Tech');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path:
        process.env.QA_ARTICLE_SCREENSHOT ??
        testInfo.outputPath('qa-article.png'),
      fullPage: true,
    });
  });
}

test('Journal filters use all four categories and isolate personal entries', async ({
  page,
}) => {
  await page.goto('/journal/');
  const cards = page.locator('[data-journal-entry]');
  await expect(cards).toHaveCount(5);
  expect(await cards.getByRole('heading').allTextContents()).toEqual([
    title,
    'QA life notes',
    'QA what-if possibilities',
    'QA humour',
    'QA nested Journal article',
  ]);
  for (const [category, label, entryTitle, count] of [
    ['thoughts-conversations', 'Thoughts & Conversations', title, 1],
    ['life-notes', 'Life Notes', 'QA life notes', 2],
    ['what-if', 'What If', 'QA what-if possibilities', 1],
    ['humour', 'Humour', 'QA humour', 1],
  ] as const) {
    const button = page.getByRole('button', { name: label, exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`#${category}$`));
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(cards.filter({ visible: true })).toHaveCount(count);
    await expect(
      cards.filter({ visible: true }).filter({ hasText: entryTitle }),
    ).toHaveCount(1);
    await expect(page.locator('[data-journal-status]')).toHaveText(
      `${count} ${count === 1 ? 'entry' : 'entries'} shown.`,
    );
  }
  await page.goBack();
  await expect(cards.filter({ visible: true })).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'What If', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(cards.filter({ visible: true })).toHaveCount(5);
  await expect(page.locator('main')).not.toContainText(
    'QA engineering & reliability',
  );
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${articlePath}$`));
});

test('Journal category labels link to working filtered listings', async ({
  page,
}) => {
  for (const [slug, label, category] of [
    ['qa-thoughts', 'Thoughts & Conversations', 'thoughts-conversations'],
    ['qa-life-notes', 'Life Notes', 'life-notes'],
    ['qa-what-if', 'What If', 'what-if'],
    ['qa-humour', 'Humour', 'humour'],
  ]) {
    await page.goto(`/journal/${slug}/`);
    const tag = page
      .locator('.article-meta')
      .getByRole('link', { name: label, exact: true });
    await expect(tag).toHaveAttribute('href', `/journal/#${category}`);
    await tag.click();
    await expect(
      page.getByRole('button', { name: label, exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page
        .locator('[data-journal-entry]')
        .filter({ visible: true })
        .filter({ hasText: 'QA' })
        .first(),
    ).toBeVisible();
  }
});

test('Tech listing filters professional content without Journal entries', async ({
  page,
}) => {
  await page.goto('/tech/');
  const cards = page.locator('[data-tech-entry]');
  const fixtures = cards.filter({
    has: page.getByRole('heading', { name: /^QA / }),
  });
  await expect(fixtures).toHaveCount(3);
  expect(await fixtures.getByRole('heading').allTextContents()).toEqual([
    'QA engineering & reliability',
    'QA community article',
    'QA nested Tech article',
  ]);
  // The two user-approved real posts remain present and unchanged by fixtures.
  await expect(cards).toHaveCount(5);
  for (const label of ['Engineering', 'Community', 'Learning']) {
    const button = page.getByRole('button', { name: label, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(fixtures.filter({ visible: true })).toHaveCount(1);
  }
  await expect(page.locator('main')).not.toContainText(title);
  await page.goto('/');
  await expect(page.locator('main')).not.toContainText(title);
  await expect(page.locator('main')).not.toContainText(
    'QA tech private unfinished draft',
  );
  await expect(page.locator('main')).not.toContainText(
    'QA tech future scheduled article',
  );
  await expect(
    page.getByRole('link', {
      name: 'Completing Deploying and Operating AI Solutions at NUS',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: 'A panel conversation at GitLab After Dark Singapore',
      exact: true,
    }),
  ).toBeVisible();
});

for (const collection of ['journal', 'tech'] as const) {
  test(`${collection} nested Markdown paths have canonical sitemap entries`, async ({
    page,
    request,
  }) => {
    const route = `/${collection}/qa-series/nested-entry/`;
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText(
      `QA nested ${collection === 'journal' ? 'Journal' : 'Tech'} article`,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://vipulgupta.tech${route}`,
    );
    const sitemap = await request.get('/sitemap.xml');
    expect(await sitemap.text()).toContain(`https://vipulgupta.tech${route}`);
  });

  test(`${collection} draft, default-draft and future entries have no route, listing or sitemap`, async ({
    page,
    request,
  }) => {
    for (const slug of ['qa-draft', 'qa-default-draft', 'qa-future']) {
      const response = await request.get(`/${collection}/${slug}/`);
      expect(response.status()).toBe(404);
    }
    await page.goto(`/${collection}/`);
    for (const text of [
      'private unfinished draft',
      'future scheduled article',
      'unpublished by default',
    ]) {
      await expect(page.locator('main')).not.toContainText(
        `QA ${collection} ${text}`,
      );
    }
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain(canonical);
    for (const slug of ['qa-draft', 'qa-default-draft', 'qa-future'])
      expect(xml).not.toContain(slug);
  });

  const route =
    collection === 'journal' ? articlePath : '/tech/qa-engineering/';
  for (const theme of ['ocean', 'charcoal'] as const) {
    for (const width of [375, 768, 1440]) {
      test(`${collection} ${theme} Markdown and sharing fit ${width}px`, async ({
        page,
      }, testInfo) => {
        await page.addInitScript(
          (value) => localStorage.setItem('vipulgupta.theme', value),
          theme,
        );
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
        await page.screenshot({
          path: testInfo.outputPath(`${collection}-${theme}-${width}.png`),
          fullPage: true,
        });
      });
    }
    for (const width of [375, 1440]) {
      test(`${collection} ${theme} article accessibility at ${width}px`, async ({
        page,
      }) => {
        await page.addInitScript(
          (value) => localStorage.setItem('vipulgupta.theme', value),
          theme,
        );
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        await expect(page.locator('[data-reaction-status]')).toContainText(
          'Reactions are unavailable',
        );
        const result = await new AxeBuilder({ page })
          .withTags([
            'wcag2a',
            'wcag2aa',
            'wcag21a',
            'wcag21aa',
            'best-practice',
          ])
          .analyze();
        expect(result.violations).toEqual([]);
      });
    }
  }

  test(`${collection} missing backend gives an honest reaction error and retry without fake totals`, async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem('article-reactions', JSON.stringify({ like: 999 })),
    );
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/reactions'))
        requests.push(request.url());
    });
    await page.goto(route);
    const region = page.getByRole('region', { name: 'React to this article' });
    await expect(region.getByRole('status')).toContainText(
      'Reactions are unavailable right now',
    );
    await expect(region.getByRole('group')).not.toBeVisible();
    await expect(region).not.toContainText('999');
    await expect(region.locator('[data-reaction-count]:visible')).toHaveCount(
      0,
    );
    expect(new URL(requests[0]).searchParams.get('article')).toBe(
      route.replace(/^\/|\/$/g, ''),
    );
    await region
      .getByRole('button', { name: 'Try again', exact: true })
      .click();
    await expect(region.getByRole('status')).toContainText(
      'Reactions are unavailable right now',
    );
    expect(requests).toHaveLength(2);
  });

  // This mock tests the browser contract only; Worker/D1 persistence is verified separately.
  for (const theme of ['ocean', 'charcoal'] as const) {
    test(`${collection} ${theme} reaction controls use server responses, keyboard toggles and failed-save recovery`, async ({
      page,
    }) => {
      await page.addInitScript(
        (value) => localStorage.setItem('vipulgupta.theme', value),
        theme,
      );
      await page.setViewportSize({ width: 375, height: 900 });
      let selected: 'like' | null = null;
      let failSave = false;
      const posts: unknown[] = [];
      await page.route('**/api/reactions?*', async (routeHandler) => {
        const request = routeHandler.request();
        if (request.method() === 'POST') {
          const body = request.postDataJSON();
          posts.push(body);
          if (failSave) {
            await routeHandler.fulfill({
              status: 503,
              json: { error: 'Temporarily unavailable' },
            });
            return;
          }
          selected = body.reaction;
        }
        await routeHandler.fulfill({
          json: {
            counts: { like: selected ? 1 : 0, helpful: 2, insightful: 3 },
            selected,
          },
        });
      });
      await page.goto(route);
      const region = page.getByRole('region', {
        name: 'React to this article',
      });
      const like = region.getByRole('button', { name: /^Like,/ });
      await expect(like).toHaveAccessibleName('Like, 0 reactions');
      await expect(like).toHaveAttribute('aria-pressed', 'false');
      await like.focus();
      await page.keyboard.press('Enter');
      await expect(region.getByRole('status')).toHaveText(
        'Your like reaction was saved.',
      );
      await expect(like).toHaveAccessibleName('Like, 1 reaction');
      await expect(like).toHaveAttribute('aria-pressed', 'true');
      const accessibility = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze();
      expect(accessibility.violations).toEqual([]);
      expect(posts[0]).toEqual({
        article: route.replace(/^\/|\/$/g, ''),
        reaction: 'like',
      });
      await like.click();
      await expect(region.getByRole('status')).toHaveText(
        'Your reaction was removed.',
      );
      await expect(like).toHaveAttribute('aria-pressed', 'false');
      expect(posts[1]).toEqual({
        article: route.replace(/^\/|\/$/g, ''),
        reaction: null,
      });
      failSave = true;
      await like.click();
      await expect(region.getByRole('status')).toContainText(
        'Your reaction could not be confirmed',
      );
      await expect(region.getByRole('group')).not.toBeVisible();
      await region
        .getByRole('button', { name: 'Try again', exact: true })
        .click();
      await expect(like).toHaveAccessibleName('Like, 0 reactions');
      await expect(like).toHaveAttribute('aria-pressed', 'false');
      await expect(like).toBeEnabled();
    });
  }

  test(`${collection} malformed backend totals remain unavailable instead of showing invented counts`, async ({
    page,
  }) => {
    await page.route('**/api/reactions?*', (routeHandler) =>
      routeHandler.fulfill({
        json: {
          counts: { like: -1, helpful: 0, insightful: 0 },
          selected: null,
        },
      }),
    );
    await page.goto(route);
    const region = page.getByRole('region', { name: 'React to this article' });
    await expect(region.getByRole('status')).toContainText(
      'Reactions are unavailable',
    );
    await expect(region.getByRole('group')).not.toBeVisible();
    await expect(region.locator('[data-reaction-count]:visible')).toHaveCount(
      0,
    );
    await expect(
      region.getByRole('button', { name: 'Try again', exact: true }),
    ).toBeVisible();
  });

  test(`${collection} without JavaScript keeps content, public sharing and honest reaction guidance`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto(`${test.info().project.use.baseURL}${route}`);
      await expect(page.locator('h1')).toHaveText(
        collection === 'journal' ? title : 'QA engineering & reliability',
      );
      await expect(
        page.getByRole('textbox', { name: 'Article link' }),
      ).toHaveValue(`https://vipulgupta.tech${route}`);
      const sharing = page.getByRole('region', { name: 'Share this article' });
      for (const name of ['LinkedIn', 'Email'])
        await expect(sharing.getByRole('link', { name })).toBeVisible();
      await expect(sharing.getByRole('link', { name: 'WhatsApp' })).toHaveCount(
        0,
      );
      await expect(
        page.getByRole('button', { name: 'Copy link', exact: true }),
      ).not.toBeVisible();
      const noScriptGuidance = page
        .getByRole('region', { name: 'React to this article' })
        .locator('noscript p');
      await expect(noScriptGuidance).toBeVisible();
      await expect(noScriptGuidance).toHaveText(
        'Enable JavaScript to view and add shared reactions.',
      );
    } finally {
      await context.close();
    }
  });
}

test('sharing links encode the production URL, title, and description', async ({
  page,
}) => {
  await page.goto(articlePath);
  const sharing = page.getByRole('region', { name: 'Share this article' });
  await expect(sharing.getByRole('link', { name: 'WhatsApp' })).toHaveCount(0);
  const linkedin = new URL(
    (await sharing
      .getByRole('link', { name: 'LinkedIn' })
      .getAttribute('href'))!,
  );
  expect(linkedin.searchParams.get('url')).toBe(canonical);
  const email = new URL(
    (await sharing.getByRole('link', { name: 'Email' }).getAttribute('href'))!,
  );
  expect(email.protocol).toBe('mailto:');
  expect(email.searchParams.get('subject')).toBe(title);
  expect(email.searchParams.get('body')).toBe(`${description}\n\n${canonical}`);
});

test('native share passes the public article details and reports success', async ({
  page,
}) => {
  await mockShare(page, 'success');
  await page.goto(articlePath);
  const button = page.getByRole('button', {
    name: 'Share article',
    exact: true,
  });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-share-status]')).toHaveText(
    'Article shared.',
  );
  expect(
    await page.evaluate(
      () => (window as unknown as { sharePayload: ShareData }).sharePayload,
    ),
  ).toEqual({ title, text: description, url: canonical });
  await expect(button).toBeEnabled();
});

test('native share cancellation is silent and permits another attempt', async ({
  page,
}) => {
  await mockShare(page, 'cancel');
  await page.goto(articlePath);
  const button = page.getByRole('button', {
    name: 'Share article',
    exact: true,
  });
  await button.click();
  await expect(button).toBeEnabled();
  await expect(page.locator('[data-share-status]')).toBeEmpty();
});

test('native share error gives useful alternatives and re-enables the action', async ({
  page,
}) => {
  await mockShare(page, 'error');
  await page.goto(articlePath);
  const button = page.getByRole('button', {
    name: 'Share article',
    exact: true,
  });
  await button.click();
  await expect(page.locator('[data-share-status]')).toContainText(
    /copy link|sharing links/i,
  );
  await expect(button).toBeEnabled();
});

test('unsupported native sharing still offers copy and social links', async ({
  page,
}) => {
  await mockShare(page, 'unavailable');
  await page.goto(articlePath);
  await expect(
    page.getByRole('button', { name: 'Share article', exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Copy link', exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: 'Share this article' })
      .getByRole('link', { name: 'LinkedIn' }),
  ).toBeVisible();
});

test('copy link puts the public canonical URL on the clipboard', async ({
  page,
}) => {
  await mockClipboard(page, 'success');
  await page.goto(articlePath);
  const button = page.getByRole('button', { name: 'Copy link', exact: true });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-share-status]')).toHaveText('Link copied.');
  expect(
    await page.evaluate(
      () => (window as unknown as { copiedURL: string }).copiedURL,
    ),
  ).toBe(canonical);
  await expect(button).toBeEnabled();
});

for (const mode of ['denied', 'unavailable'] as const) {
  test(`clipboard ${mode} exposes a focused, selectable manual public URL`, async ({
    page,
  }) => {
    await mockClipboard(page, mode);
    await page.goto(articlePath);
    await page.getByRole('button', { name: 'Copy link', exact: true }).click();
    const link = page.getByRole('textbox', { name: 'Article link' });
    await expect(link).toBeVisible();
    await expect(link).toHaveValue(canonical);
    await expect(link).toHaveAttribute('readonly', '');
    await expect(link).toBeFocused();
    await expect(page.locator('[data-share-status]')).toContainText(
      /select and copy/i,
    );
  });
}
