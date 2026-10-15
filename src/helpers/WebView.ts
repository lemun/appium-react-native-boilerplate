export const NATIVE_CONTEXT = 'NATIVE_APP';

type DetailedContext = { id: string; url?: string; title?: string };

export type WebViewMatcher = {
  /** Match the page URL (substring or regular expression). */
  url?: string | RegExp;
  /** Match the page title (substring or regular expression). */
  title?: string | RegExp;
  /** How long to wait for a matching, loaded WebView context. Defaults to 45s (iOS can be slow). */
  timeout?: number;
};

function matches(value: string | undefined, expected: string | RegExp | undefined): boolean {
  if (expected === undefined) {
    return true;
  }

  if (value === undefined) {
    return false;
  }

  return typeof expected === 'string' ? value.includes(expected) : expected.test(value);
}

/**
 * Hybrid-app helper: find the right WebView context, switch into it, wait for the document to load,
 * and always come back to the native context.
 *
 * Why the extra work: `getContexts()` returns WebViews in random order, iOS may list several
 * (`WEBVIEW_<pid>.<n>`), a fresh iOS WebView first reports `about:blank`, and on Android Chrome's own
 * WebView can show up as well. Matching on url/title from the detailed context list avoids all of that.
 */
class WebView {
  /** Wait until a WebView context that matches `matcher` (and is not `about:blank`) exists; return its id. */
  async waitForContext({ url, title, timeout = 45_000 }: WebViewMatcher = {}): Promise<string> {
    let found: string | undefined;

    await driver.waitUntil(
      async () => {
        const contexts = (await driver.getContexts({ returnDetailedContexts: true })) as DetailedContext[];
        const match = contexts.find(
          (context) =>
            context.id !== NATIVE_CONTEXT &&
            context.url !== undefined &&
            context.url !== 'about:blank' &&
            matches(context.url, url) &&
            matches(context.title, title),
        );
        found = match?.id;

        return found !== undefined;
      },
      { timeout, interval: 500, timeoutMsg: `No WebView context matching ${String(url ?? title ?? 'any page')}` },
    );

    if (found === undefined) {
      throw new Error('WebView context disappeared after it was found');
    }

    return found;
  }

  /** Switch into the matching WebView and wait until `document.readyState` is `complete`. */
  async switchToWebView(matcher: WebViewMatcher = {}): Promise<void> {
    const contextId = await this.waitForContext(matcher);

    if (driver.isAndroid) {
      // On Android one WEBVIEW_<package> context hosts several pages; WebdriverIO picks the right page (window)
      // when we pass url/title, and falls back to the context id otherwise.
      const { url, title } = matcher;
      await driver.switchContext(
        url === undefined && title === undefined
          ? contextId
          : {
              ...(url === undefined ? {} : { url: toRegExp(url) }),
              ...(title === undefined ? {} : { title: toRegExp(title) }),
            },
      );
    } else {
      await driver.switchAppiumContext(contextId);
    }

    await this.waitForDocumentReady();
  }

  async switchToNative(): Promise<void> {
    await driver.switchAppiumContext(NATIVE_CONTEXT);
  }

  /** Run `action` inside the WebView and always return to the native context, even when it throws. */
  async within<T>(matcher: WebViewMatcher, action: () => Promise<T>): Promise<T> {
    await this.switchToWebView(matcher);

    try {
      return await action();
    } finally {
      await this.switchToNative();
    }
  }

  async waitForDocumentReady(timeout = 20_000): Promise<void> {
    await driver.waitUntil(async () => (await driver.execute(() => document.readyState)) === 'complete', {
      timeout,
      interval: 250,
      timeoutMsg: 'WebView document did not finish loading',
    });
  }
}

function toRegExp(value: string | RegExp): RegExp {
  return typeof value === 'string' ? new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) : value;
}

export default new WebView();
