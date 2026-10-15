# Notes for contributors and coding agents

- Before committing: `npm run validate` (typecheck, lint, format check, unit tests). It needs no device.
- E2E runs need a simulator/emulator and the demo app: `npm run doctor`, then `npm run app:download -- <platform>`
  and `npm run ios` or `npm run android`. They take minutes; run one spec with `-- --spec <file>`.
- Specs never contain selectors. Add a private getter plus a public action to a screen object in `src/screenobjects`.
- Build selectors with the helpers in `src/helpers/Utils.ts`. WebdriverIO 10 `$()` is strict: it throws when more
  than one element matches.
- `expect(element).toHaveText(...)` and other element matchers are async and must be awaited;
  `expect(value).toBe(...)` on a plain value is synchronous and must not be awaited (the linter enforces both).
- Put user-facing copy used in assertions in `src/i18n/en.json` and read it with `t('key')`.
- Imports use `.ts` extensions; only erasable TypeScript syntax is allowed (no enums, no parameter properties),
  because `scripts/` and unit tests run on Node's built-in type stripping.
- When bumping the demo app, update `src/config/demoApp.ts` (version, asset names, SHA-256 from the GitHub release
  asset digests) and re-check the ids in the screen objects against the app source.
- The Appium server binds to `127.0.0.1` (`appiumService()` in `wdio.conf.ts`). Enable an insecure Appium feature
  only in the platform config whose specs need it, as a comma-separated string (Appium does not parse an array
  passed through the service), and update `src/config/appiumServer.test.ts` to match.
