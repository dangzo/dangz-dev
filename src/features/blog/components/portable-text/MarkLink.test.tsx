import { render, screen } from '@testing-library/react';
import MarkLink from './MarkLink';

describe('article reference links', () => {
  it.each([
    ['https://REFERENCES.example:8443/path?private=value#fragment', 'references.example'],
    ['http://references.example:8080/path', 'references.example'],
    ['//references.example/path', 'references.example'],
  ])('marks external reference %s with hostname-only properties', (href, host) => {
    render(<MarkLink postId="post-1" value={{ href }}><code>Reference</code></MarkLink>);
    const link = screen.getByRole('link', { name: 'Reference' });

    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const attributes = Object.fromEntries(link.getAttributeNames()
      .filter((name) => name.startsWith('data-umami-event'))
      .map((name) => [name, link.getAttribute(name)]));
    expect(attributes).toEqual({
      'data-umami-event': 'outbound_link_clicked',
      'data-umami-event-post_id': 'post-1',
      'data-umami-event-destination_host': host,
      'data-umami-event-placement': 'article_body',
    });
    expect(link.querySelector('code')).not.toHaveAttribute('data-umami-event');
  });

  it.each([
    '/blog/example', 'relative/path', '#section', '?query=value',
    'https://dangz.dev/blog/example', 'https://www.dangz.dev/blog/example', '//dangz.dev/blog/example',
    'http://localhost:3100/blog/example', 'http://127.0.0.1:3100/blog/example', 'http://[::1]:3100/blog/example',
    'http://127.0.0.2/reference', 'http://2130706433/reference',
    'mailto:example@example.com', 'tel:123', 'ftp://references.example/file', 'javascript:void(0)',
    'https://', '',
  ])('does not mark internal or ineligible link %s', (href) => {
    const { container } = render(<MarkLink postId="post-1" value={{ href }}>Reference</MarkLink>);
    const link = container.querySelector('a');

    expect(link).not.toHaveAttribute('data-umami-event');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('preserves the fragment fallback when a link has no href', () => {
    render(<MarkLink postId="post-1">Reference</MarkLink>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '#');
    expect(screen.getByRole('link')).not.toHaveAttribute('data-umami-event');
  });
});
