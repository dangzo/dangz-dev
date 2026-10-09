import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TabbedCodeBlock from './TabbedCodeBlock';

const variants = ['Vue', 'React', 'Bash'].map((label, index) => ({
  key: label,
  label,
  value: {
    code: `  ${label} code\n\n`,
    language: ['vue', 'tsx', 'bash'][index],
    highlightedHtml: {
      light: `<pre class="shiki"><code><span class="line">${label} light</span></code></pre>`,
      dark: `<pre class="shiki"><code><span class="line">${label} dark</span></code></pre>`,
    },
  },
}));

describe('TabbedCodeBlock', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
    vi.unstubAllGlobals();
  });

  it('selects the first variant and links the active panel to its tab', () => {
    render(<TabbedCodeBlock variants={variants} />);

    const tabs = screen.getAllByRole('tab');
    const panel = screen.getByRole('tabpanel');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tabs[0].id);
    expect(tabs.map(tab => tab.tabIndex)).toEqual([0, -1, -1]);
    expect(panel).toHaveTextContent('Vue light');
    expect(screen.queryByText('React light')).not.toBeInTheDocument();
  });

  it('switches by pointer and automatically activates wrapping keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<TabbedCodeBlock variants={variants} />);

    await user.click(screen.getByRole('tab', { name: 'React' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('React light');
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Bash' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Vue' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Vue light');
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Bash light');
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Vue' })).toHaveFocus();
    expect(screen.getAllByRole('tab').map(tab => tab.tabIndex)).toEqual([0, -1, -1]);
  });

  it('copies exact active code and clears confirmation when switching away and back', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(<TabbedCodeBlock variants={variants} />);

    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(writeText).toHaveBeenLastCalledWith(variants[0].value.code);
    expect(screen.getByRole('button', { name: 'Copy code' })).toHaveTextContent('Copied');
    await user.click(screen.getByRole('tab', { name: 'React' }));
    expect(screen.getByRole('button', { name: 'Copy code' })).toHaveTextContent(/^Copy$/);
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(writeText).toHaveBeenLastCalledWith(variants[1].value.code);
    await user.click(screen.getByRole('tab', { name: 'Vue' }));
    expect(screen.getByRole('button', { name: 'Copy code' })).toHaveTextContent(/^Copy$/);
  });

  it('does not transfer a delayed clipboard confirmation to another variant', async () => {
    const user = userEvent.setup();
    let finishCopy: (() => void) | undefined;
    const pendingCopy = new Promise<void>(resolve => {
      finishCopy = resolve;
    });
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockReturnValue(pendingCopy) } });
    render(<TabbedCodeBlock variants={variants} />);

    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    await user.click(screen.getByRole('tab', { name: 'React' }));
    await act(async () => {
      finishCopy?.();
      await pendingCopy;
    });
    expect(screen.getByRole('button', { name: 'Copy code' })).toHaveTextContent(/^Copy$/);
    await user.click(screen.getByRole('tab', { name: 'Vue' }));
    expect(screen.getByRole('button', { name: 'Copy code' })).toHaveTextContent(/^Copy$/);
  });

  it('updates highlighted content when the theme changes', async () => {
    render(<TabbedCodeBlock variants={variants} />);
    document.documentElement.classList.add('dark');
    await waitFor(() => expect(screen.getByRole('tabpanel')).toHaveTextContent('Vue dark'));
  });

  it('renders a single variant with its syntax language as the tab label', () => {
    render(<TabbedCodeBlock variants={[variants[0]]} />);
    expect(screen.getByRole('tab', { name: 'vue' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('tab', { name: 'Vue' })).not.toBeInTheDocument();
    expect(screen.getByTestId('syntax-highlighter')).toHaveTextContent('Vue light');
  });

  it('shows only author labels for multiple variants without duplicate syntax labels', async () => {
    const user = userEvent.setup();
    render(<TabbedCodeBlock variants={variants} />);
    expect(screen.queryByText('vue')).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'React' }));
    expect(screen.queryByText('tsx')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'React' })).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps multiple groups independent with unique tab and panel IDs', async () => {
    const user = userEvent.setup();
    render(<><TabbedCodeBlock variants={variants} /><TabbedCodeBlock variants={variants} /></>);
    const groups = screen.getAllByRole('tablist');
    const tabs = screen.getAllByRole('tab');
    expect(new Set(tabs.map(tab => tab.id)).size).toBe(tabs.length);
    await user.click(within(groups[0]).getByRole('tab', { name: 'React' }));
    expect(screen.getAllByRole('tabpanel')[0]).toHaveTextContent('React light');
    expect(screen.getAllByRole('tabpanel')[1]).toHaveTextContent('Vue light');
  });
});
