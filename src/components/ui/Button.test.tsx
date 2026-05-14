import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Button from './Button';

vi.mock('next/link', () => import('@/test/mocks/nextLink'));

describe('Button', () => {
  it('renders a native button and invokes onClick when there is no `to` prop', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick}>
        Save
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn.tagName).toBe('BUTTON');
    await user.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an internal link when `to` starts with `/` and there is no download', () => {
    render(<Button to="/about">About</Button>);
    const link = screen.getByRole('link', { name: 'About' });
    expect(link).toHaveAttribute('href', '/about');
    expect(link).not.toHaveAttribute('target');
  });

  it('renders an external link with safe defaults when `to` is not an app route', () => {
    render(
      <Button to="https://example.com/page" data-umami-event="Docs Click">
        Docs
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', 'https://example.com/page');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('data-umami-event', 'Docs Click');
  });

  it('uses explicit target and rel when provided for external targets', () => {
    render(
      <Button to="https://example.com" target="_self" rel="nofollow">
        Visit
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Visit' });
    expect(link).toHaveAttribute('target', '_self');
    expect(link).toHaveAttribute('rel', 'nofollow');
  });

  it('treats internal paths with download as outbound-style links', () => {
    render(
      <Button to="/files/resume.pdf" download>
        Download
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Download' });
    expect(link).toHaveAttribute('href', '/files/resume.pdf');
    expect(link).toHaveAttribute('download', '');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
