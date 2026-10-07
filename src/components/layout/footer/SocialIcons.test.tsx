import { render, screen } from '@testing-library/react';

import { links } from '@/data/siteMetadata';
import SocialIcons from './SocialIcons';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

describe('SocialIcons', () => {
  it('renders mail, GitHub, and LinkedIn links with expected hrefs', async () => {
    const ui = await SocialIcons();
    render(ui);

    expect(screen.getByRole('link', { name: /mail/i })).toHaveAttribute('href', `mailto:${links.email}`);
    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute('href', links.github);
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', links.linkedin);
  });

  it('attaches only the unified event properties to footer anchors', async () => {
    render(await SocialIcons());

    const expected = [
      { name: /mail/i, event: 'contact_clicked', properties: { channel: 'email', placement: 'footer' } },
      { name: /github/i, event: 'outbound_link_clicked', properties: { destination_host: 'github.com', placement: 'footer' } },
      { name: /linkedin/i, event: 'contact_clicked', properties: { channel: 'linkedin', placement: 'footer' } },
    ];

    for (const { name, event, properties } of expected) {
      const link = screen.getByRole('link', { name });
      const analytics = Object.fromEntries(link.getAttributeNames()
        .filter((attribute) => attribute.startsWith('data-umami-event-'))
        .map((attribute) => [attribute.slice('data-umami-event-'.length), link.getAttribute(attribute)]));

      expect(link).toHaveAttribute('data-umami-event', event);
      expect(analytics).toEqual(properties);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
