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

  it('attaches umami event labels for footer analytics', async () => {
    const ui = await SocialIcons();
    render(ui);

    expect(screen.getByRole('link', { name: /mail/i })).toHaveAttribute('data-umami-event', 'Footer Email Click');
    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute('data-umami-event', 'Footer GitHub Click');
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute('data-umami-event', 'Footer LinkedIn Click');
  });
});
