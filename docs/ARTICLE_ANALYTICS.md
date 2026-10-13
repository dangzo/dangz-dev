# Article sharing and reference analytics

| Event | Custom properties | Trigger |
| --- | --- | --- |
| `heading_link_copied` | `post_id`, `section_id` | H2/H3/H4 clipboard write resolves successfully |
| `outbound_link_clicked` | `post_id`, `destination_host`, `placement=article_body` | External HTTP(S) reference activation |

`post_id` is the CMS document ID. `section_id` is the existing heading fragment, including duplicate-heading suffixes. Copying does not establish subsequent sharing; reference activation does not establish destination reading.

Copies use the [shared buffered transport](ANALYTICS.md#delivery-boundaries). Capture source context before awaiting the clipboard. Rejection/unavailability emits nothing and preserves feedback; tracker failure cannot change successful-copy feedback. Clipboard contents retain the current URL with its fragment replaced; custom data omits copied URLs and raw heading text.

Reference anchors use server-rendered Umami attributes and its delegated mouse/native Enter/nested-element handler. Add no manual tracker call or second listener. They are unbuffered before readiness. Only external absolute/protocol-relative HTTP(S) links qualify: exclude `dangz.dev`, `www.dangz.dev`, localhost/loopback, relative links, fragments and other schemes. Send hostname without port/path/query/fragment. Preserve native new-tab navigation and `noopener noreferrer`. Delegated source metadata can contain queries; see [privacy and verification](ANALYTICS.md).

## Validation

Unit coverage: `src/features/blog/utils/articleAnalytics.test.ts` and HeadingAnchor/MarkLink tests beside portable-text components. Browser: `yarn test:e2e src/tests/e2e/article-analytics.spec.ts`; add article/contact regressions for shared controls. The pinned real tracker uses a fictitious ID and intercepted collector/destinations. Check successful/rejected copying, repeated H2/H3/H4 headings, reference filtering, properties, delayed readiness and native navigation.

Follow [production verification](ANALYTICS.md#verification), checking clipboard contents independently and owner grouping by post/section or post/host/placement. [#190](https://github.com/dangzo/dangz-dev/issues/190) is closed; [dated evidence limits](ANALYTICS.md#dated-evidence-receipts) distinguish reported local receipts from published evidence. Scroll depth, ToC clicks and ScrollToTop have no events. Rollback removes copy instrumentation/reference attributes; historical events remain.
