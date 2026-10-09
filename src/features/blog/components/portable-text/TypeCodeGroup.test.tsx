import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { highlightCodeWithShiki } from '@/features/blog/utils/shikiHighlighter';
import type { CodeGroup } from '@/types/sanity.types';

import TypeCodeGroup from './TypeCodeGroup';

vi.mock('@/features/blog/utils/shikiHighlighter', () => ({
  highlightCodeWithShiki: vi.fn(async (code: string, language?: string) => ({
    language: language || 'plaintext',
    html: {
      light: `<pre class="shiki"><code>${code}</code></pre>`,
      dark: `<pre class="shiki"><code>${code}</code></pre>`,
    },
  })),
}));

describe('TypeCodeGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('highlights every author-written variant on the server and preserves code whitespace', async () => {
    const value: CodeGroup = {
      _type: 'codeGroup',
      variants: [
        { _type: 'codeVariant', _key: 'vue', label: 'Vue', snippet: { _type: 'code', code: '  vue code\n\n', language: 'vue' } },
        { _type: 'codeVariant', _key: 'react', label: 'React', snippet: { _type: 'code', code: 'react code', language: 'tsx' } },
      ],
    };
    render(await TypeCodeGroup({ value }));

    expect(highlightCodeWithShiki).toHaveBeenCalledWith('  vue code\n\n', 'vue');
    expect(highlightCodeWithShiki).toHaveBeenCalledWith('react code', 'tsx');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('vue code');
    await userEvent.setup().click(screen.getByRole('tab', { name: 'React' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('react code');
    expect(screen.queryByText('tsx')).not.toBeInTheDocument();
  });

  it('filters incomplete draft variants and treats a missing language as plaintext', async () => {
    const value: CodeGroup = {
      _type: 'codeGroup',
      variants: [
        { _type: 'codeVariant', _key: 'missing' },
        { _type: 'codeVariant', _key: 'blank-label', label: '  ', snippet: { _type: 'code', code: 'hidden' } },
        { _type: 'codeVariant', _key: 'blank-code', label: 'Hidden', snippet: { _type: 'code', code: ' \n ' } },
        { _type: 'codeVariant', _key: 'valid', label: 'Example', snippet: { _type: 'code', code: 'plain code' } },
      ],
    };
    render(await TypeCodeGroup({ value }));

    expect(highlightCodeWithShiki).toHaveBeenCalledTimes(1);
    expect(highlightCodeWithShiki).toHaveBeenCalledWith('plain code', undefined);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByTestId('syntax-highlighter')).toHaveTextContent('plain code');
    expect(screen.getByRole('tab', { name: 'plaintext' })).toHaveAttribute('aria-selected', 'true');
  });

  it.each([undefined, []])('renders an empty draft group safely', async variants => {
    const { container } = render(await TypeCodeGroup({ value: { _type: 'codeGroup', variants } }));
    expect(container).toBeEmptyDOMElement();
    expect(highlightCodeWithShiki).not.toHaveBeenCalled();
  });
});
