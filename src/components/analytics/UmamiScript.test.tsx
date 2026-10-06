import { render, screen } from '@testing-library/react';
import type { ScriptProps } from 'next/script';
import UmamiScript from './UmamiScript';
import { UMAMI_READY_EVENT } from '@/utils/umami';

const script = vi.hoisted(() => ({ onReady: undefined as ScriptProps['onReady'] }));

vi.mock('next/script', () => ({
  default: ({ onReady, ...props }: Readonly<ScriptProps>) => {
    script.onReady = onReady;

    return (
      <script data-testid="umami-script" {...props} />
    );
  },
}));

it('preserves the tracker configuration and announces script readiness', () => {
  const onReady = vi.fn();
  window.addEventListener(UMAMI_READY_EVENT, onReady);

  try {
    render(<UmamiScript />);
    const element = screen.getByTestId('umami-script');
    expect(element).toHaveAttribute('src', 'https://cloud.umami.is/script.js');
    expect(element).toHaveAttribute('strategy', 'lazyOnload');
    expect(element).toHaveAttribute('data-website-id', '546ca232-1b93-4b09-862d-8aebf53123d0');
    expect(onReady).not.toHaveBeenCalled();

    script.onReady?.();
    expect(onReady).toHaveBeenCalledOnce();
  } finally {
    window.removeEventListener(UMAMI_READY_EVENT, onReady);
  }
});
