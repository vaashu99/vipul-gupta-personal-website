import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  cleanupFixtures,
  fixtureEntries,
  prepareFixtures,
} from './journal-fixtures.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
// Allow a predeployment verification to disable retries without changing CI defaults.
const testArguments = ['test'];
if (process.env.JOURNAL_TEST_RETRIES !== undefined) {
  if (!/^\d+$/.test(process.env.JOURNAL_TEST_RETRIES)) {
    throw new Error('JOURNAL_TEST_RETRIES must be a nonnegative integer.');
  }
  testArguments.push('--', `--retries=${process.env.JOURNAL_TEST_RETRIES}`);
}
let activeChild;
let interrupted = false;

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    interrupted = true;
    activeChild?.kill('SIGTERM');
  });
}

async function run(args, environment = process.env) {
  if (interrupted) throw new Error('Journal verification interrupted');
  await new Promise((resolve, reject) => {
    activeChild = spawn('npm', args, {
      cwd: root,
      stdio: 'inherit',
      env: environment,
    });
    activeChild.once('error', reject);
    activeChild.once('exit', (code, signal) => {
      activeChild = undefined;
      if (code === 0) resolve();
      else
        reject(new Error(`npm ${args.join(' ')} failed (${signal ?? code})`));
    });
  });
}

async function verifyCleanOutput(directory = path.join(root, 'dist')) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (fixtureEntries.some(({ slug }) => entry.name.includes(slug))) {
      throw new Error(`Fixture route remains in ordinary output: ${file}`);
    }
    if (entry.isDirectory()) await verifyCleanOutput(file);
    else if (/\.(html|xml|txt|js|json)$/i.test(entry.name)) {
      const content = await readFile(file, 'utf8');
      if (fixtureEntries.some(({ slug }) => content.includes(slug))) {
        throw new Error(`Fixture content remains in ordinary output: ${file}`);
      }
    }
  }
}

async function snapshotRealArticles(
  directory = path.join(root, 'src/content'),
) {
  const files = new Map();
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      for (const [name, hash] of await snapshotRealArticles(file))
        files.set(name, hash);
    } else {
      files.set(
        file,
        createHash('sha256')
          .update(await readFile(file))
          .digest('hex'),
      );
    }
  }
  return files;
}

async function verifyRealArticles(before) {
  const after = await snapshotRealArticles();
  if (
    before.size !== after.size ||
    Array.from(before).some(([file, hash]) => after.get(file) !== hash)
  ) {
    throw new Error(
      'Content cleanup changed real content or left a temporary article behind.',
    );
  }
}

const originalArticles = await snapshotRealArticles();

try {
  const fixtureOutput = await mkdtemp(
    path.join(tmpdir(), 'vipul-journal-fixtures-'),
  );
  try {
    await prepareFixtures();
    await run(['run', 'build', '--', '--outDir', fixtureOutput]);
    await run(testArguments, {
      ...process.env,
      CI: '1',
      JOURNAL_FIXTURE_TESTS: '1',
      PLAYWRIGHT_PORT: process.env.PLAYWRIGHT_PORT ?? '4322',
      PLAYWRIGHT_DIST_DIR: fixtureOutput,
    });
  } finally {
    try {
      await cleanupFixtures();
      await verifyRealArticles(originalArticles);
      // Restore the regular fixture-free build even after a test/build failure.
      interrupted = false;
      await run(['run', 'build']);
      await verifyCleanOutput();
      console.log(
        'Restored ordinary build: no QA fixture routes or content remain.',
      );
    } finally {
      await rm(fixtureOutput, { recursive: true, force: true });
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
