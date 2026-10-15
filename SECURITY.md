# Security notes

This repository is a test harness. Its dependencies are devDependencies that run on a developer machine or a CI
runner while the E2E suite runs. Nothing from it ships inside an app.

## Appium server exposure

WebdriverIO starts the project-local Appium 3 server as a child process. The server listens on `127.0.0.1` only and
stops when the run ends. The only insecure feature it enables is `uiautomator2:adb_shell`, and only for Android. The
README's Security section explains why, and `src/config/appiumServer.test.ts` checks both settings.

## `npm audit` triage (2026-10-15)

| Lockfile                                              | Packages flagged                     | Advisories (GHSA) | Vulnerable installed copies |
| ----------------------------------------------------- | ------------------------------------ | ----------------- | --------------------------- |
| before (`appium` 3.8.0, xcuitest 12.18.1, uia2 8.7.0) | 20 (15 critical, 4 high, 1 moderate) | 20                | 9                           |
| after (same versions, `shell-quote` override)         | 20 (15 critical, 4 high, 1 moderate) | 20                | 8                           |

Every vulnerable copy is a dependency of the Appium server or its two drivers. The direct packages are already at
their latest stable releases: `appium` 3.8.0, `appium-xcuitest-driver` 12.18.1 and `appium-uiautomator2-driver`
8.7.0. The only newer uiautomator2 driver is 9.0.0-beta.1, a prerelease for Appium 4. Other packages are flagged only
because of these copies: `appium`, the two drivers, `@appium/*`, `appium-ios-*`, `appium-remote-debugger`,
`appium-webdriveragent` and `appium-xcode`. npm audit marks a package by name, so any vulnerable copy of a name
flags every package that depends on that name.

What changed:

- **`shell-quote` override `^1.12.0`.** `@appium/support` 7.2.8 pins `shell-quote` to exactly `1.10.0`, so Appium's
  own server process loaded the vulnerable copy. `1.12.0` is a minor update within the same major version.
  The override replaces the top-level copy, which the Appium server uses.
- **Lockfile regenerated.** The other top-level copies were already at fixed versions: `axios` 1.20.0, `morgan`
  1.12.1, `proxy-addr` 2.0.8, `sharp` 0.35.5 and `brace-expansion` 5.0.12.

What remains, and why npm cannot fix it: both drivers publish with `bundleDependencies`. Their
`node_modules/appium-*-driver/node_modules/...` trees come from the driver tarball as they are, so npm does not
re-resolve them and `overrides` do not reach them. Only a new driver release fixes them. The remaining advisories, as
reported by `npm audit --json` on 2026-10-15, are listed below. The reachability notes hold for the WebdriverIO configs
in this repo: `wdio.ios.conf.ts` and `wdio.android.conf.ts` with the loopback-only server, local app paths, and no
MJPEG options. If you add capabilities or settings that make the driver contact an address you supply, such as
`appium:mjpegScreenshotUrl` or an `appium:app` URL, the analysis changes. In that case, re-check `axios` and `sharp`
first.

| Package (bundled in)                   | Advisories                                                                                                                                                                 | Why it is not reachable here                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shell-quote` 1.10.0 (both drivers)    | GHSA-pqg4-j6r4-53mv, critical: `quote()` command injection                                                                                                                 | The xcuitest driver uses `quote()` only to build log messages. The uiautomator2 driver also uses it to build `adb shell` command lines from driver arguments. Only a client of the loopback-only server can send those arguments, and that client already has `mobile: shell` on the emulator.                                                                                                                                                                       |
| `proxy-addr` 2.0.7 (uiautomator2)      | GHSA-jqcg-44mw-7w3h, critical: IP spoofing via an IPv4-mapped IPv6 `trust proxy` subnet                                                                                    | It belongs to the driver's bundled Express copy, which never serves HTTP; Appium's own server uses the fixed top-level 2.0.8. Appium also never sets `trust proxy`, so no subnet is configured.                                                                                                                                                                                                                                                                      |
| `morgan` 1.11.0 (uiautomator2)         | GHSA-jxfw-x594-9x9m, GHSA-9f6g-j8ch-79g4, moderate: log forging and log injection                                                                                          | It is the request logger of that same unused Express copy. Appium's server logs with the fixed 1.12.1.                                                                                                                                                                                                                                                                                                                                                               |
| `axios` 1.19.0 (uiautomator2)          | 12 advisories (7 high, 5 moderate, per `npm audit --json` on 2026-10-15): prototype-pollution gadgets, ReDoS, header injection, proxy and redirect handling, an HTTP/2 DoS | With the configs in this repo, which set no MJPEG URL and no app URL, the driver calls only fixed local endpoints: the UiAutomator2 server on the emulator through an adb port forward, and Chromedriver on localhost. These are not attacker-controlled URLs or redirects. A caller-supplied `appium:mjpegScreenshotUrl` would make the driver fetch that URL with this `axios`. The prototype-pollution gadgets need a separate pollution bug in the same process. |
| `sharp` 0.35.4 (uiautomator2)          | GHSA-wq5f-xc86-pv6w, high: librsvg (SVG decoding) CVE                                                                                                                      | With the configs in this repo, the driver decodes only device screenshots (PNG) with it, never SVG. A caller-supplied MJPEG URL would feed it frames from that server instead.                                                                                                                                                                                                                                                                                       |
| `brace-expansion` 5.0.9 (uiautomator2) | GHSA-q2hr-2g5m-vwhr, GHSA-qhr7-859c-m2p7, GHSA-6j4f-fj2g-mc7p: CPU or stack DoS on crafted patterns                                                                        | The glob patterns are fixed strings in the driver code, and the worst outcome is a stalled local test run.                                                                                                                                                                                                                                                                                                                                                           |

To re-check after a driver release, run `npm update appium appium-xcuitest-driver appium-uiautomator2-driver &&
npm audit`. Remove the `shell-quote` override once `@appium/support` no longer pins `1.10.0`
(`npm view @appium/support dependencies.shell-quote`).

## Reporting a problem

Open a GitHub issue and leave out exploit details. Ask for a private channel if you need one.
