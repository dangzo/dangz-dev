import { render, screen } from '@testing-library/react';

import { author } from '@/data/siteMetadata';
import { BUILD_SEMVER } from '@/data/buildVersion';
import Footer from './Footer';

vi.mock('./SocialIcons', () => ({
  default: function SocialIconsPlaceholder() {
    return <div data-testid="footer-social-icons" />;
  },
}));

vi.mock('next/link', () => import('@/test/mocks/nextLink'));

describe('Footer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders copyright year, author, and build version', async () => {
    render(await Footer());

    expect(screen.getByText('© 2026')).toBeInTheDocument();
    expect(screen.getByText(author)).toBeInTheDocument();
    expect(screen.getByText(`v${BUILD_SEMVER}`)).toBeInTheDocument();
  });

  it('reserves space for the social icons row above the copyright line', async () => {
    render(await Footer());

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByTestId('footer-social-icons')).toBeInTheDocument();
  });
});
