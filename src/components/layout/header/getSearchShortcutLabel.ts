export const getSearchShortcutLabel = () => {
  if (typeof navigator === 'undefined') {
    return 'Ctrl+K';
  }

  const platform = navigator.platform || '';
  const isApplePlatform = /Mac|iPhone|iPod|iPad/i.test(platform);

  return isApplePlatform ? '⌘K' : 'Ctrl+K';
};
