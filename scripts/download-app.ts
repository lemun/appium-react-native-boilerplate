/**
 * Download the pinned WebdriverIO native demo app into ./apps and verify its SHA-256.
 *
 *   npm run app:download            # both platforms
 *   npm run app:download -- ios     # iOS simulator build only (.zip, ~16 MB)
 *   npm run app:download -- android # Android build only (.apk, ~124 MB)
 *
 * Existing files with a matching checksum are kept, so the script is safe to re-run (and to cache in CI).
 */
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { APPS_DIR, DEMO_APP, type Platform } from '../src/config/demoApp.ts';

const PLATFORMS: readonly Platform[] = ['ios', 'android'];

async function sha256(file: string): Promise<string> {
  const hash = createHash('sha256');
  await pipeline(createReadStream(file), hash);

  return hash.digest('hex');
}

async function download(platform: Platform): Promise<void> {
  const { asset, sha256: expected } = DEMO_APP[platform];
  const target = join(APPS_DIR, asset);

  if (existsSync(target) && (await sha256(target)) === expected) {
    console.log(`✔ ${platform}: ${target} is present and verified`);

    return;
  }

  const url = `${DEMO_APP.releaseUrl}/${asset}`;
  console.log(`↓ ${platform}: ${url}`);

  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`Download failed for ${url}: HTTP ${response.status}`);
  }

  const partial = `${target}.partial`;
  await pipeline(Readable.fromWeb(response.body as NodeReadableStream<Uint8Array>), createWriteStream(partial));

  const actual = await sha256(partial);

  if (actual !== expected) {
    await rm(partial, { force: true });
    throw new Error(`Checksum mismatch for ${asset}: expected ${expected}, got ${actual}`);
  }

  await rename(partial, target);
  console.log(`✔ ${platform}: saved to ${target} (sha256 verified)`);
}

const requested = process.argv.slice(2);
const invalid = requested.filter((name) => !PLATFORMS.includes(name as Platform));

if (invalid.length > 0) {
  console.error(`Unknown platform(s): ${invalid.join(', ')}. Use: ${PLATFORMS.join(' | ')}`);
  process.exit(1);
}

await mkdir(APPS_DIR, { recursive: true });

for (const platform of requested.length > 0 ? (requested as Platform[]) : PLATFORMS) {
  await download(platform);
}
