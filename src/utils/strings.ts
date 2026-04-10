export function slugify(text: string): string {
  const normalized = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  return normalized || 'section';
}

export const kebabCase = (str: string) => {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

export const startCase = (str: string) => {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};