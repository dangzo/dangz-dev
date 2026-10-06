# Pinned Umami browser fixture

`tracker.txt` is the unmodified production tracker fetched from
`https://cloud.umami.is/script.js` for the #168 audit on 2026-10-05.
SHA-256: `91a876d767646fd5b7701b6fabf97f8a99ae53b94e7e5b58d465bad1e5d763e0`.

The text extension keeps third-party minified code outside application linting.
Playwright serves it as JavaScript through an intercepted test-only script URL.
Tests use a fictitious website ID, disable automatic pageviews, intercept every
collector request, and fulfill outbound profile destinations locally. No live
analytics or outbound service is needed. The fixture contains no audit tokens
or collector cache values.

This fixture tests the captured tracker version, not future cloud updates.
Production verification must use the actual deployed tracker separately.
To update the fixture, fetch the official script, review its behavior, record
the capture date and SHA-256 here, and rerun the contact browser suite.

Upstream: https://github.com/umami-software/umami. See `LICENSE` for its MIT license.
