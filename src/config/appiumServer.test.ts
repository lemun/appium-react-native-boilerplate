import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { launcher as AppiumLauncher, type AppiumServiceConfig } from '@wdio/appium-service';

/**
 * Proves what the Appium child server is really started with, without starting it: the platform config's
 * `appium` service entry goes through @wdio/appium-service (which turns `args` into CLI flags), and the
 * resulting command line is parsed by Appium's own CLI parser.
 */

/** Appium leaves flags that were not passed undefined (its defaults are applied later, from the schema). */
interface ParsedServerArgs {
  address?: string;
  allowInsecure?: string[];
}

interface AppiumArgParser {
  parseArgs(args: string[]): ParsedServerArgs;
}

const require = createRequire(import.meta.url);
// `appium` has no package exports map; its CLI parser is plain CommonJS.
const { getParser } = require('appium/build/lib/cli/parser.js') as { getParser: () => Promise<AppiumArgParser> };

/** Run the service's onPrepare with the process start stubbed out; return the Appium CLI arguments. */
async function appiumCliArgs(config: WebdriverIO.Config): Promise<string[]> {
  const entry = config.services?.find((service) => Array.isArray(service) && service[0] === 'appium');
  assert.ok(Array.isArray(entry), 'the config has an appium service entry');

  // No log redirection and a copy of the capabilities: onPrepare must not touch the file system or the config.
  const options: AppiumServiceConfig = { ...(entry[1] as AppiumServiceConfig) };
  delete options.logPath;
  const capabilities = structuredClone(config.capabilities) as WebdriverIO.Capabilities[];
  const service = new AppiumLauncher(options, capabilities);

  let started: string[] | undefined;
  // `_startAppium` is private; replacing it keeps the test offline. If the service renames it, onPrepare would
  // try to spawn a real server, so the test fails loudly rather than passing silently.
  (service as unknown as { _startAppium: (command: string, args: string[]) => Promise<unknown> })._startAppium = async (
    _command,
    args,
  ) => {
    started = args;
    const stream = { on: () => stream };

    return Promise.resolve({ stdout: stream, stderr: stream });
  };
  await service.onPrepare();

  assert.ok(started, 'the Appium server would have been started');

  // started[0] is Appium's main.js; the rest are the server flags.
  return started.slice(1);
}

async function effectiveServerArgs(config: WebdriverIO.Config): Promise<ParsedServerArgs> {
  const parser = await getParser();

  return parser.parseArgs(['server', ...(await appiumCliArgs(config))]);
}

describe('Appium server started by the wdio configs', () => {
  let appDir: string;

  before(() => {
    // The platform configs resolve the app binary when loaded; point them at a placeholder file.
    appDir = mkdtempSync(join(tmpdir(), 'appium-config-test-'));
    process.env['APP_PATH'] = join(appDir, 'placeholder.app');
    writeFileSync(process.env['APP_PATH'], '');
  });

  after(() => {
    rmSync(appDir, { recursive: true, force: true });
  });

  it('listens on loopback only and has no insecure features on iOS', async () => {
    const { config } = await import('../../wdio.ios.conf.ts');
    const server = await effectiveServerArgs(config);

    assert.equal(server.address, '127.0.0.1');
    assert.equal(server.allowInsecure, undefined);
  });

  it('listens on loopback only and allows just uiautomator2:adb_shell on Android', async () => {
    const { config } = await import('../../wdio.android.conf.ts');
    const server = await effectiveServerArgs(config);

    assert.equal(server.address, '127.0.0.1');
    assert.deepEqual(server.allowInsecure, ['uiautomator2:adb_shell']);
  });
});
