import { render, screen } from '@testing-library/react';
import TagChip from './TagChip';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

describe('TagChip', () => {
  it('renders the topic display name and its canonical archive link', () => {
    render(<TagChip _id="topic-ai" displayName="AI-Assisted Development" slug={{ current: 'ai-assisted-development' }} description="Working with coding agents." />);

    const link = screen.getByRole('link', { name: 'AI-Assisted Development' });
    expect(link).toHaveAttribute('href', '/blog/topics/ai-assisted-development');
    expect(link).not.toHaveClass('uppercase');
  });
});
