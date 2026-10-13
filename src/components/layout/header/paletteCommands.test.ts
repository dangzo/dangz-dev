import { filterPaletteCommands } from './paletteCommands';

describe('filterPaletteCommands', () => {
  it('returns the complete ordered command collection for empty input', () => {
    expect(filterPaletteCommands('  ').map((command) => command.label)).toEqual([
      'Connect on LinkedIn', 'Download résumé', 'Email me', 'Go to About',
      'Go to Home', 'Go to Post list', 'Toggle light/dark theme', 'View GitHub',
    ]);
  });

  it('matches all query terms across labels and aliases regardless of case or accents', () => {
    expect(filterPaletteCommands('  DOWNLOAD CV  ').map((command) => command.label)).toEqual(['Download résumé']);
    expect(filterPaletteCommands('resume').map((command) => command.label)).toEqual(['Download résumé']);
    expect(filterPaletteCommands('post ARTICLES').map((command) => command.label)).toEqual(['Go to Post list']);
    expect(filterPaletteCommands('system automatic')).toEqual([]);
    expect(filterPaletteCommands('github nonexistent')).toEqual([]);
  });
});
