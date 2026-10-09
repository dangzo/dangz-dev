import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CodeBlock from './CodeBlock';

const sampleHighlightedHtml = {
  light: '<pre class="shiki"><code><span class="line">const x = 1;</span></code></pre>',
  dark: '<pre class="shiki"><code><span class="line">const x = 1; // dark</span></code></pre>',
};

describe('CodeBlock', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
    vi.unstubAllGlobals();
  });

  it('renders the code string in the syntax highlighter', async () => {
    render(
      <CodeBlock
        value={{
          code: 'const x = 1;',
          language: 'typescript',
          highlightedHtml: sampleHighlightedHtml,
        }}
      />,
    );

    const highlighter = await screen.findByTestId('syntax-highlighter');
    expect(highlighter).toHaveTextContent('const x = 1;');
  });

  it('shows the normalized language as a single selected tab', async () => {
    render(
      <CodeBlock
        value={{
          code: 'echo hi',
          language: 'bash',
          highlightedHtml: sampleHighlightedHtml,
        }}
      />,
    );

    expect(await screen.findByRole('tab', { name: 'bash' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByText('bash')).toHaveLength(1);
  });

  it('shows vue label when language is vue', async () => {
    render(
      <CodeBlock
        value={{
          code: '<template><div>Hello</div></template>',
          language: 'vue',
          highlightedHtml: sampleHighlightedHtml,
        }}
      />,
    );

    await screen.findByTestId('syntax-highlighter');
    expect(await screen.findByRole('tab', { name: 'vue' })).toBeInTheDocument();
  });

  it('shows a plaintext tab for legacy plaintext snippets', async () => {
    render(
      <CodeBlock
        value={{
          code: 'plain',
          language: 'plaintext',
          highlightedHtml: sampleHighlightedHtml,
        }}
      />,
    );

    await screen.findByTestId('syntax-highlighter');
    expect(screen.getByRole('tab', { name: 'plaintext' })).toHaveAttribute('aria-selected', 'true');
  });

  it('copies the snippet to the clipboard and briefly shows confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(
      <CodeBlock
        value={{
          code: 'copy me',
          language: 'js',
          highlightedHtml: sampleHighlightedHtml,
        }}
      />,
    );

    await screen.findByTestId('syntax-highlighter');

    const copyButton = screen.getByRole('button', { name: 'Copy code' });
    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith('copy me');
    expect(screen.getByRole('button', { name: 'Copy code' })).toHaveTextContent('Copied');

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Copy code' })).toHaveTextContent('Copy');
      },
      { timeout: 3000 },
    );
  });

  it('follows the document dark class for theme-sensitive chrome', async () => {
    document.documentElement.classList.add('dark');

    render(
      <CodeBlock
        value={{
          code: 'dark',
          language: 'json',
          highlightedHtml: sampleHighlightedHtml,
        }}
      />,
    );

    const root = (await screen.findByTestId('syntax-highlighter')).closest('[data-code-group]');
    expect(root).toHaveClass('dark:border-gray-800');
    expect(screen.getByTestId('syntax-highlighter')).toHaveTextContent('const x = 1; // dark');
  });
});
