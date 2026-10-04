import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const routes = [
  '/',
  '/experience/',
  '/about/',
  '/journal/',
  '/photos/',
  '/tech/',
  '/my-space/',
  '/chat/',
  '/inbox/',
  '/tech/gitlab-after-dark-singapore/',
  '/tech/nus-ai-solutions/',
  '/404.html',
];
const widths = [375, 768, 1440];
const themes = ['ocean', 'charcoal'] as const;
const journalCategories = [
  'All',
  'Thoughts & Conversations',
  'Life Notes',
  'What If',
  'Humour',
];

function colorChannels(color: string): number[] {
  return (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
}

function luminance(color: string): number {
  const channels = colorChannels(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first: string, second: string): number {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function gifFrames(bytes: Buffer): number {
  expect(bytes.subarray(0, 6).toString('ascii')).toMatch(/^GIF8[79]a$/);
  let cursor = 13;
  if (bytes[10] & 0x80) cursor += 3 * 2 ** ((bytes[10] & 7) + 1);
  let frames = 0;
  const skipBlocks = () => {
    while (cursor < bytes.length) {
      const length = bytes[cursor++];
      if (length === 0) return;
      cursor += length;
    }
    throw new Error('Truncated GIF sub-block');
  };
  while (cursor < bytes.length) {
    const block = bytes[cursor++];
    if (block === 0x3b) return frames;
    if (block === 0x21) {
      cursor++;
      skipBlocks();
    } else if (block === 0x2c) {
      frames++;
      const flags = bytes[cursor + 8];
      cursor += 9;
      if (flags & 0x80) cursor += 3 * 2 ** ((flags & 7) + 1);
      cursor++;
      skipBlocks();
    } else {
      throw new Error(`Invalid GIF block at byte ${cursor - 1}`);
    }
  }
  throw new Error('GIF trailer not found');
}

for (const width of widths) {
  test(`the supplied homepage photo loads and remains inside a ${width}px viewport`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const photo = page.getByRole('img', { name: /Vipul/i });
    await expect(photo).toBeVisible();
    await expect(photo).toHaveAttribute(
      'alt',
      /Vipul.+aquarium|aquarium.+Vipul/i,
    );
    await expect(photo).toHaveAttribute('width', '1200');
    await expect(photo).toHaveAttribute('height', '872');
    await expect
      .poll(() =>
        photo.evaluate((element) => {
          const image = element as HTMLImageElement;
          return (
            image.complete && image.naturalWidth > 0 && image.naturalHeight > 0
          );
        }),
      )
      .toBe(true);
    const image = await photo.evaluate(async (element) => {
      const photo = element as HTMLImageElement;
      const box = element.getBoundingClientRect();
      // srcset density correction can round naturalWidth/naturalHeight.
      // Decode the selected asset to measure its actual pixel proportions.
      const bitmap = await createImageBitmap(
        await (await fetch(photo.currentSrc)).blob(),
      );
      const pixelWidth = bitmap.width;
      const pixelHeight = bitmap.height;
      bitmap.close();
      return {
        source: photo.currentSrc,
        left: box.left,
        right: box.right,
        width: box.width,
        height: box.height,
        pixelWidth,
        pixelHeight,
        pixelRatio: pixelWidth / pixelHeight,
      };
    });
    expect(image.source).toMatch(
      /\/images\/portrait-enhanced-(?:600|1200|2400)\.webp$/,
    );
    expect(image.left).toBeGreaterThanOrEqual(0);
    expect(image.right).toBeLessThanOrEqual(width + 1);
    expect(image.width).toBeGreaterThan(150);
    expect(image.height).toBeGreaterThan(100);
    expect(image.pixelWidth).toBe(
      Number(image.source.match(/-(\d+)\.webp$/)?.[1]),
    );
    expect(Math.abs(image.pixelRatio - 1200 / 872)).toBeLessThan(0.001);
    expect(
      Math.abs(image.width / image.height - image.pixelRatio),
    ).toBeLessThan(0.01);
  });
}

for (const palette of themes) {
  test(`${palette} keeps body text, primary actions, and keyboard focus readable`, async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('Theme', { exact: true }).selectOption(palette);
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .map((animation) => animation.finished.catch(() => {})),
      ),
    );
    const theme = await page.locator('body').evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        text: style.color,
        fontSize: parseFloat(style.fontSize),
      };
    });
    if (palette === 'charcoal')
      expect(luminance(theme.background)).toBeLessThan(0.08);
    else expect(luminance(theme.background)).toBeGreaterThan(0.8);
    expect(contrast(theme.text, theme.background)).toBeGreaterThanOrEqual(4.5);
    expect(theme.fontSize).toBeGreaterThanOrEqual(16);
    const action = page.getByRole('link', { name: 'Explore my experience' });
    await action.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(action).toBeFocused();
    const styles = await action.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        text: style.color,
        background: style.backgroundColor,
        outline: style.outlineColor,
        outlineStyle: style.outlineStyle,
        outlineWidth: parseFloat(style.outlineWidth),
      };
    });
    expect(contrast(styles.text, styles.background)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(styles.outlineStyle).not.toBe('none');
    expect(styles.outlineWidth).toBeGreaterThanOrEqual(2);
    expect(contrast(styles.outline, theme.background)).toBeGreaterThanOrEqual(
      3,
    );
  });
}

test('Experience serves a real animated GIF and supports keyboard pause and resume', async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/experience/');
  const image = page.getByRole('img', { name: /Illustrated DevOps cycle/i });
  await expect(image).toBeVisible();
  await expect(
    page.getByText('An illustration of a DevOps workflow.', { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).currentSrc),
    )
    .toMatch(/\/images\/devops-pipeline\.gif$/);
  const source = await image.evaluate(
    (element) => (element as HTMLImageElement).currentSrc,
  );
  const asset = await request.get(source);
  expect(asset.status()).toBe(200);
  expect(asset.headers()['content-type']).toContain('image/gif');
  expect(gifFrames(await asset.body())).toBeGreaterThan(1);
  const pause = page.getByRole('button', {
    name: 'Pause animation',
    exact: true,
  });
  await expect(pause).toHaveAttribute('aria-pressed', 'false');
  await pause.focus();
  await page.keyboard.press('Enter');
  const resume = page.getByRole('button', {
    name: 'Resume animation',
    exact: true,
  });
  await expect(resume).toHaveAttribute('aria-pressed', 'true');
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).currentSrc),
    )
    .toMatch(/\/images\/devops-pipeline-still\.png$/);
  await expect(resume).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(pause).toHaveAttribute('aria-pressed', 'false');
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).currentSrc),
    )
    .toBe(source);
});

test('reduced motion selects the still DevOps image and never requests the GIF', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const animationRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/devops-pipeline.gif'))
      animationRequests.push(request.url());
  });
  await page.goto('/experience/');
  const image = page.getByRole('img', { name: /Illustrated DevOps cycle/i });
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).currentSrc),
    )
    .toMatch(/\/images\/devops-pipeline-still\.png$/);
  await expect(
    page.getByRole('button', { name: /Pause animation|Resume animation/i }),
  ).not.toBeVisible();
  expect(animationRequests).toEqual([]);
});

test('changing the motion preference replaces animation with the still image immediately', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/experience/');
  const image = page.getByRole('img', { name: /Illustrated DevOps cycle/i });
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).currentSrc),
    )
    .toMatch(/\.gif$/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).currentSrc),
    )
    .toMatch(/-still\.png$/);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).currentSrc),
    )
    .toMatch(/\.gif$/);
  await expect(
    page.getByRole('button', { name: 'Pause animation', exact: true }),
  ).toBeVisible();
});

test('the printed resume omits animation and retains light-paper text contrast', async ({
  page,
}) => {
  await page.goto('/experience/');
  await page.emulateMedia({ media: 'print' });
  await expect(
    page.locator('img[alt^="Illustrated DevOps cycle"]'),
  ).not.toBeVisible();
  await expect(
    page.getByText('An illustration of a DevOps workflow.', { exact: true }),
  ).not.toBeVisible();
  const print = await page.locator('body').evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, text: style.color };
  });
  expect(luminance(print.background)).toBeGreaterThan(0.9);
  expect(luminance(print.text)).toBeLessThan(0.08);
  expect(contrast(print.text, print.background)).toBeGreaterThanOrEqual(4.5);
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test('without JavaScript Experience shows the still illustration and no inert animation control', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const animationRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/devops-pipeline.gif'))
      animationRequests.push(request.url());
  });
  await page.goto(`${testInfo.project.use.baseURL}/experience/`);
  const image = page.getByRole('img', { name: /Illustrated DevOps cycle/i });
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).currentSrc),
    )
    .toMatch(/-still\.png$/);
  await expect(
    page.getByRole('button', { name: /Pause animation|Resume animation/i }),
  ).not.toBeVisible();
  expect(animationRequests).toEqual([]);
  await context.close();
});

test('every page has distinct search metadata and one primary heading', async ({
  page,
}) => {
  const titles = new Set<string>();
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).not.toBeEmpty();
    const title = await page.title();
    expect(title).toContain('Vipul');
    expect(titles.has(title), `duplicate page title at ${route}`).toBe(false);
    titles.add(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /\S.{30,}/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://vipulgupta.tech${route}`,
    );
  }
});

for (const width of widths) {
  test(`all pages fit the ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      for (const palette of themes) {
        if (width < 1100)
          await page
            .getByRole('button', { name: 'Open navigation', exact: true })
            .click();
        await page.getByLabel('Theme', { exact: true }).selectOption(palette);
        if (width < 1100)
          await page
            .getByRole('button', { name: 'Close navigation', exact: true })
            .click();
        const dimensions = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          content: document.documentElement.scrollWidth,
        }));
        expect(
          dimensions.content,
          `${palette} horizontal overflow at ${route}`,
        ).toBeLessThanOrEqual(dimensions.viewport + 1);
      }
    }
  });
}

test('header links reach each public section', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const links = [
    ['Experience', '/experience/'],
    ['About', '/about/'],
    ['Journal', '/journal/'],
    ['Tech', '/tech/'],
    ['My Space', '/my-space/'],
    ['Home', '/'],
  ];
  for (const [label, route] of links) {
    await page
      .locator('header')
      .getByRole('link', { name: label, exact: true })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`${route.replaceAll('/', '\\/')}$`),
    );
    await expect(page.locator('main h1')).toBeVisible();
  }
});

test('mobile menu works with keyboard, closes on Escape, and restores focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /menu|navigation/i });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  const experience = page
    .locator('header')
    .getByRole('link', { name: 'Experience', exact: true });
  await expect(experience).not.toBeVisible();
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(experience).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Enter');
  await experience.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/experience\/$/);
  await expect(page.locator('h1')).toBeVisible();
});

test('skip link takes keyboard visitors to the main content', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: /skip.*content/i });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('reduced-motion preferences disable smooth scrolling and significant transitions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const motion = await page.evaluate(() => {
    const durations = Array.from(document.querySelectorAll('*')).flatMap(
      (element) => {
        const style = getComputedStyle(element);
        return [style.transitionDuration, style.animationDuration].flatMap(
          (value) => value.split(',').map((duration) => parseFloat(duration)),
        );
      },
    );
    return {
      scroll: getComputedStyle(document.documentElement).scrollBehavior,
      maximumSeconds: Math.max(...durations),
    };
  });
  expect(motion.scroll).toBe('auto');
  expect(motion.maximumSeconds).toBeLessThanOrEqual(0.001);
});

test('journal filters expose their selected category and honest empty states', async ({
  page,
}) => {
  await page.goto('/journal/');
  const categories = journalCategories;
  for (const category of categories) {
    const filter = page.getByRole('button', { name: category, exact: true });
    await filter.focus();
    await page.keyboard.press('Enter');
    await expect(filter).toHaveAttribute('aria-pressed', 'true');
    for (const other of categories.filter((item) => item !== category)) {
      await expect(
        page.getByRole('button', { name: other, exact: true }),
      ).toHaveAttribute('aria-pressed', 'false');
    }
    const visibleEntries = page.locator('main article:visible');
    if (await visibleEntries.count()) {
      await expect(page.getByRole('status')).not.toContainText(/no .*yet/i);
      if (category !== 'All') {
        for (const entry of await visibleEntries.all()) {
          await expect(entry).toContainText(category);
        }
      }
    } else {
      await expect(page.getByRole('status')).toContainText(
        /no .*yet|nothing .*yet|coming soon/i,
      );
    }
  }
});

test('photos communicate that public collections are not published yet', async ({
  page,
}) => {
  await page.goto('/photos/');
  await expect(page.locator('main')).toContainText(
    /no .*yet|coming soon|will appear|not .*yet/i,
  );
  await expect(page.locator('main')).not.toContainText(
    /unlock album|enter password/i,
  );
});

test('journal category links and browser history preserve the visitor selection', async ({
  page,
}) => {
  await page.goto('/journal/#what-if');
  await expect(
    page.getByRole('button', { name: 'What If', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  if (await page.locator('main article:visible').count()) {
    await expect(page.getByRole('status')).not.toContainText(/no .*yet/i);
  } else {
    await expect(page.getByRole('status')).toContainText(
      'No what-if writing published yet.',
    );
  }
  await page.getByRole('button', { name: 'Life Notes', exact: true }).click();
  await expect(page).toHaveURL(/#life-notes$/);
  await page.goBack();
  await expect(page).toHaveURL(/#what-if$/);
  await expect(
    page.getByRole('button', { name: 'What If', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/journal/#unknown-category');
  await expect(
    page.getByRole('button', { name: 'All', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('experience presents source-backed employers and the stated AWS achievement', async ({
  page,
}) => {
  await page.goto('/experience/');
  const main = page.locator('main');
  const career = [
    ['GXS Bank (Grab)', 'Lead SRE Engineer', 'April 2025 – present'],
    ['GXS Bank (Grab)', 'Senior SRE Engineer', 'March 2022 – March 2025'],
    ['Xylem Inc.', 'Senior DevOps Engineer', 'September 2019 – March 2022'],
    ['Xylem Inc.', 'DevOps Engineer', 'March 2018 – September 2019'],
    [
      'Onmobile Global Limited',
      'Operations Engineer',
      'July 2015 – March 2018',
    ],
  ];
  for (const [employer, role, period] of career) {
    const entry = main.getByRole('article').filter({ hasText: period });
    await expect(entry).toContainText(employer);
    await expect(
      entry.getByRole('heading', { name: role, exact: true }),
    ).toBeVisible();
  }
  await expect(main).toContainText(/25\s*%|25 percent/i);
  await expect(main).toContainText(/AWS/);
  await expect(main).toContainText(/education/i);
  await expect(main).toContainText(/certification|credentials/i);
  await expect(main).toContainText('IES, IPS Academy');
  await expect(main).toContainText('S.V. Polytechnic Indore');
  await expect(main).toContainText(
    'Red Hat Certified Specialist in Containers and Kubernetes',
  );
  const gxs = main.getByRole('article').filter({ hasText: 'GXS Bank (Grab)' });
  await expect(gxs).toHaveCount(2);
  await expect(gxs.getByRole('heading')).toHaveText([
    'Lead SRE Engineer',
    'Senior SRE Engineer',
  ]);
  const lead = gxs.filter({
    has: page.getByRole('heading', { name: 'Lead SRE Engineer', exact: true }),
  });
  const senior = gxs.filter({
    has: page.getByRole('heading', {
      name: 'Senior SRE Engineer',
      exact: true,
    }),
  });
  await expect(lead).toContainText(/automation/i);
  await expect(lead).toContainText(
    /infrastructure.*AI solutions|AI solutions.*infrastructure/i,
  );
  await expect(lead).toContainText(/governance standards/i);
  await expect(lead).toContainText(/GitLab/);
  await expect(senior).toContainText(/technical architecture/i);
  await expect(senior).toContainText(/Istio/);
  await expect(senior).toContainText(/25\s*%|25 percent/i);
  await expect(lead).not.toContainText(/25\s*%|25 percent/i);
  expect(
    (await gxs.allTextContents()).join(' ').match(/25\s*%|25 percent/gi),
  ).toHaveLength(1);
  const leadResponsibilities = (
    await lead.getByRole('listitem').allTextContents()
  ).map((item) => item.trim());
  const seniorResponsibilities = (
    await senior.getByRole('listitem').allTextContents()
  ).map((item) => item.trim());
  expect(
    leadResponsibilities.filter((item) =>
      seniorResponsibilities.includes(item),
    ),
  ).toEqual([]);
  await expect(
    main.getByText('March 2022 – present', { exact: true }),
  ).toHaveCount(0);
  await expect(main.locator('dl[aria-label="Role progression"]')).toHaveCount(
    0,
  );
  await expect(lead).toContainText('April 2025 – present');
  await expect(senior).toContainText('March 2022 – March 2025');
  const nus = main
    .getByRole('article')
    .filter({ hasText: 'Deploying and Operating AI Solutions' });
  await expect(nus).toContainText('National University of Singapore');
  await expect(nus).toContainText('Issued July 2026');
  const redHat = main.getByRole('article').filter({
    hasText: 'Red Hat Certified Specialist in Containers and Kubernetes',
  });
  await expect(redHat).toContainText('Issued September 2021');
  await expect(redHat).toContainText('Expired September 2024');
});

test('the confirmed Lead designation is consistent across public introductions and the printable resume', async ({
  page,
}) => {
  for (const route of ['/', '/about/', '/experience/']) {
    await page.goto(route);
    await expect(page.locator('main')).toContainText('Lead SRE Engineer');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Lead SRE Engineer/,
    );
    if (route === '/about/') {
      await expect(page.locator('main')).toContainText(
        /worked as a Lead SRE Engineer/,
      );
    }
    if (route !== '/experience/') {
      await expect(page.locator('main')).not.toContainText(
        'Senior SRE Engineer',
      );
    }
  }
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.resume-identity')).toBeVisible();
  await expect(page.locator('.resume-identity')).toContainText(
    'Lead SRE Engineer',
  );
  await expect(page.locator('main')).toContainText('April 2025 – present');
  await expect(page.locator('main')).toContainText('March 2022 – March 2025');
  await expect(page.locator('main')).toContainText('Expired September 2024');
});

test('the resume prints without site navigation or interactive controls', async ({
  page,
}) => {
  await page.goto('/experience/');
  const print = page.getByRole('button', { name: /print.*r[eé]sum[eé]/i });
  await expect(print).toBeVisible();
  await page.evaluate(() => {
    window.print = () => {
      document.documentElement.dataset.printRequested = 'true';
    };
  });
  await print.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute(
    'data-print-requested',
    'true',
  );
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('banner')).not.toBeVisible();
  await expect(page.locator('footer')).not.toBeVisible();
  await expect(print).not.toBeVisible();
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('main')).toContainText('GXS Bank');
});

test('unknown URLs return a real 404 with a usable way home', async ({
  page,
}) => {
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('main')).toContainText(/404|not found/i);
  await expect(page.locator('main h1')).toBeVisible();
  const home = page
    .locator('main')
    .getByRole('link', { name: /home/i })
    .first();
  await expect(home).toHaveAttribute('href', '/');
  await home.click();
  expect(new URL(page.url()).pathname).toBe('/');
});

test('production assets omit the source resume, private identifiers, and trackers', async () => {
  async function filesIn(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map((entry) => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? filesIn(file) : Promise.resolve([file]);
      }),
    );
    return nested.flat();
  }
  const files = await filesIn(path.resolve('dist'));
  expect(files.filter((file) => /\.pdf$/i.test(file))).toEqual([]);
  expect(files.filter((file) => /IMG_3888/i.test(file))).toEqual([]);
  for (const image of [
    'portrait-enhanced-600.webp',
    'portrait-enhanced-1200.webp',
    'portrait-enhanced-2400.webp',
    'portrait-enhanced-full.webp',
  ]) {
    const bytes = await readFile(path.resolve('dist/images', image));
    expect(bytes.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(bytes.subarray(8, 12).toString('ascii')).toBe('WEBP');
    const chunks: string[] = [];
    for (let cursor = 12; cursor + 8 <= bytes.length;) {
      chunks.push(bytes.subarray(cursor, cursor + 4).toString('ascii'));
      const size = bytes.readUInt32LE(cursor + 4);
      cursor += 8 + size + (size & 1);
    }
    expect(
      chunks.filter((chunk) => ['EXIF', 'XMP ', 'ICCP'].includes(chunk)),
    ).toEqual([]);
  }
  for (const file of files.filter((item) =>
    /\.(html|js|json|css)$/i.test(item),
  )) {
    const content = await readFile(file, 'utf8');
    expect(content, `private details in ${file}`).not.toMatch(
      /date of birth|visa status|nationality|certificate id|certification id|service_account|private_key/i,
    );
    expect(content, `tracker or external font in ${file}`).not.toMatch(
      /google-analytics\.com|googletagmanager\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/i,
    );
  }
});

for (const theme of themes) {
  for (const width of [375, 1440]) {
    for (const route of routes) {
      test(`accessibility: ${theme} ${route} at ${width}px has no axe violations`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        if (width < 1100)
          await page
            .getByRole('button', { name: 'Open navigation', exact: true })
            .click();
        await page.getByLabel('Theme', { exact: true }).selectOption(theme);
        await page.evaluate(() =>
          Promise.all(
            document
              .getAnimations()
              .map((animation) => animation.finished.catch(() => {})),
          ),
        );
        const results = await new AxeBuilder({ page })
          .withTags([
            'wcag2a',
            'wcag2aa',
            'wcag21a',
            'wcag21aa',
            'best-practice',
          ])
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
}

test('Ocean is the default and the chooser persists Charcoal across routes and reloads', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean');
  const picker = page.getByLabel('Theme', { exact: true });
  await expect(picker.locator('option')).toHaveText(['Ocean', 'Charcoal']);
  await picker.selectOption('charcoal');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'charcoal');
  await page.goto('/about/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'charcoal');
  await expect(picker).toHaveValue('charcoal');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'charcoal');
  await picker.selectOption('ocean');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean');
});

for (const saved of ['warm', 'invalid']) {
  test(`a saved ${saved} preference migrates to Ocean`, async ({ page }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('vipulgupta.theme', value),
      saved,
    );
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean');
    await expect(page.getByLabel('Theme', { exact: true })).toHaveValue(
      'ocean',
    );
    expect(
      await page.evaluate(() => localStorage.getItem('vipulgupta.theme')),
    ).toBe('ocean');
  });
}

test('a blocked preference store leaves theme controls usable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Denied', 'SecurityError');
    };
    Storage.prototype.setItem = () => {
      throw new DOMException('Denied', 'SecurityError');
    };
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean');
  await page.getByLabel('Theme', { exact: true }).selectOption('charcoal');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'charcoal');
});

test('mobile visitors can select a theme and navigate to every new hub', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  for (const [label, route] of [
    ['Tech', '/tech/'],
    ['My Space', '/my-space/'],
    ['Journal', '/journal/'],
  ]) {
    await page
      .getByRole('button', { name: 'Open navigation', exact: true })
      .click();
    const picker = page.getByLabel('Theme', { exact: true });
    await picker.focus();
    await picker.selectOption('charcoal');
    await page
      .locator('header')
      .getByRole('link', { name: label, exact: true })
      .click();
    expect(new URL(page.url()).pathname).toBe(route);
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      'charcoal',
    );
  }
});

test('My Space anchors and the preserved gallery connect without invented content', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/my-space/');
  const sections = page.getByRole('navigation', { name: 'Explore My Space' });
  for (const name of ['Travel', 'Photos', 'Memories']) {
    await sections.getByRole('link', { name, exact: true }).click();
    const id = name.toLowerCase();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toContainText(/no .+yet|not .+yet/i);
  }
  await page.getByRole('link', { name: 'Visit the photo gallery' }).click();
  expect(new URL(page.url()).pathname).toBe('/photos/');
  await expect(
    page.locator('header').getByRole('link', { name: 'My Space', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.status()).toBe(200);
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toContain('https://vipulgupta.tech/my-space/');
  for (const route of ['/', '/about/', '/my-space/']) {
    await page.goto(route);
    await expect(
      page.locator(
        'a[href^="/journal/#travel"], a[href^="/journal/#notes"], a[href^="/journal/#photo-essays"]',
      ),
    ).toHaveCount(0);
  }
});

test('the high-resolution portrait opens independently and decodes the full supplied frame', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const full = page.getByRole('link', {
    name: 'View a larger photo of Vipul Gupta in a new tab',
  });
  await expect(full).toHaveAttribute('target', '_blank');
  await expect(full).toHaveAttribute('rel', /noopener/);
  await expect(full).toHaveAttribute(
    'href',
    '/images/portrait-enhanced-full.webp',
  );
  const dimensions = await full.evaluate(async (link) => {
    const image = await createImageBitmap(
      await (await fetch((link as HTMLAnchorElement).href)).blob(),
    );
    const result = { width: image.width, height: image.height };
    image.close();
    return result;
  });
  expect(dimensions.width).toBeGreaterThanOrEqual(3800);
  expect(
    Math.abs(dimensions.width / dimensions.height - 1200 / 872),
  ).toBeLessThan(0.002);
  expect(
    (await request.get('/images/portrait-enhanced-full.webp')).status(),
  ).toBe(200);
});

test('homepage focus preserves AI and existing infrastructure achievements while recent cards follow the theme', async ({
  page,
}) => {
  await page.goto('/');
  const focus = page.getByRole('region', { name: /Making complex systems/i });
  await expect(focus).toContainText(/Infrastructure for AI/);
  await expect(focus).toContainText(/Dependable infrastructure/);
  await expect(focus).toContainText(/Automation with purpose/);
  await expect(focus).toContainText(/25% less AWS spend/);
  const recent = page.locator('.recent-posts');
  const backgrounds: string[] = [];
  for (const theme of themes) {
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    const style = await recent.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        background: computed.backgroundColor,
        image: computed.backgroundImage,
      };
    });
    expect(style.image).not.toContain('devops-infinity');
    backgrounds.push(style.background);
  }
  expect(backgrounds[0]).not.toBe(backgrounds[1]);
  await page.goto('/experience/');
  expect(
    await page
      .locator('.experience-header')
      .evaluate((element) => getComputedStyle(element).backgroundImage),
  ).toContain('devops-infinity');
  await page.emulateMedia({ media: 'print' });
  expect(
    await page
      .locator('.experience-header')
      .evaluate((element) => getComputedStyle(element).backgroundImage),
  ).not.toContain('devops-infinity');
});

test('published Tech posts use distinct professional categories and publication dates', async ({
  page,
}) => {
  await page.goto('/tech/');
  expect(
    await page.locator('[data-tech-entry]').count(),
  ).toBeGreaterThanOrEqual(2);
  for (const [category, title] of [
    ['Community', 'A panel conversation at GitLab After Dark Singapore'],
    ['Learning', 'Completing Deploying and Operating AI Solutions at NUS'],
  ]) {
    await page.getByRole('button', { name: category, exact: true }).click();
    const visible = page.locator('[data-tech-entry]:visible');
    const selected = visible.filter({
      has: page.getByRole('heading', { name: title, exact: true }),
    });
    await expect(selected).toHaveCount(1);
    await selected.getByRole('heading').getByRole('link').click();
    await expect(page.locator('main h1')).toHaveText(title);
    await expect(page.locator('.article-prose')).toContainText(
      /publication date on my website/,
    );
    if (category === 'Learning')
      await expect(page.locator('.article-prose')).toContainText('July 2026');
    await expect(
      page
        .getByRole('region', { name: 'Share this article' })
        .getByRole('link', { name: 'WhatsApp' }),
    ).toHaveCount(0);
    await page.goto('/tech/');
  }
});

test('static preview never claims unavailable chat or reactions were delivered', async ({
  page,
}) => {
  await page.goto('/chat/');
  await expect(page.getByRole('status')).toContainText(/unavailable/i);
  await expect(page.getByRole('status')).not.toContainText(
    /sent|delivered|ready when you are/i,
  );
  await expect(
    page.getByRole('link', { name: 'Find me on LinkedIn' }),
  ).toBeVisible();
  await page.goto('/tech/nus-ai-solutions/');
  const reaction = page.getByRole('region', { name: 'React to this article' });
  await expect(reaction.getByRole('status')).toContainText(/unavailable/i);
  await expect(
    reaction.getByRole('group', { name: 'Choose an article reaction' }),
  ).not.toBeVisible();
  await expect(
    reaction.getByRole('button', { name: 'Try again' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Chat with Vipul' }),
  ).toHaveAttribute('href', '/chat/');
});

for (const palette of themes) {
  for (const destination of ['chat', 'inbox']) {
    test(`${palette} ${destination} loaded UI renders message markup as literal text and stays accessible`, async ({
      page,
    }) => {
      const threadId = '11111111-2222-3333-4444-555555555555';
      const literal =
        '<img src=x onerror="window.__chatExecuted=true"><script>window.__chatExecuted=true</script>';
      const message = {
        id: 1,
        sender: 'visitor',
        content: literal,
        createdAt: '2026-10-04T12:00:00Z',
      };
      await page.setViewportSize({ width: 375, height: 812 });
      await page.addInitScript(
        (theme) => localStorage.setItem('vipulgupta.theme', theme),
        palette,
      );
      await page.route('**/api/**', async (route) => {
        const url = new URL(route.request().url());
        const json =
          url.pathname === '/api/inbox/threads'
            ? {
                threads: [
                  {
                    id: threadId,
                    updatedAt: message.createdAt,
                    lastMessage: literal,
                  },
                ],
              }
            : { threadId, messages: [message] };
        await route.fulfill({ status: 200, json });
      });
      await page.goto(`/${destination}/`);
      if (destination === 'inbox')
        await page
          .getByRole('button', { name: /Conversation · 11111111/ })
          .click();
      const transcript = page.getByRole('list', {
        name:
          destination === 'chat'
            ? 'Conversation messages'
            : 'Conversation messages',
      });
      await expect(transcript).toContainText(literal);
      await expect(transcript.locator('img, script')).toHaveCount(0);
      expect(
        await page.evaluate(
          () =>
            (window as Window & { __chatExecuted?: boolean }).__chatExecuted,
        ),
      ).toBeUndefined();
      await expect(
        page.getByLabel(
          destination === 'chat' ? 'Your message' : 'Your reply',
          { exact: true },
        ),
      ).toBeVisible();
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze();
      expect(result.violations).toEqual([]);
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
    });
  }
}
