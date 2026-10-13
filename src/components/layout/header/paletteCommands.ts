import headerNavLinks from '@/data/headerNavLinks';
import { links } from '@/data/siteMetadata';
import { contactAnalytics, type ContactAnalyticsAttributes } from '@/utils/contactAnalytics';

type CommandDetails = Readonly<{
  id: string;
  label: string;
  keywords: string;
}>;

export type PaletteCommand = CommandDetails & (
  | Readonly<{ kind: 'navigation'; href: string }>
  | Readonly<{ kind: 'theme' }>
  | Readonly<{
    kind: 'contact';
    href: string;
    download?: boolean;
    analytics: ContactAnalyticsAttributes;
  }>
);

const commands: readonly PaletteCommand[] = [
  ...headerNavLinks.map((link): PaletteCommand => ({
    id: `go-${link.title.toLowerCase()}`,
    label: link.title === 'Blog' ? 'Go to Post list' : `Go to ${link.title}`,
    keywords: link.title === 'Blog' ? 'blog posts articles writing' : link.title,
    kind: 'navigation',
    href: link.href,
  })),
  { id: 'toggle-theme', label: 'Toggle light/dark theme', keywords: 'appearance color mode', kind: 'theme' },
  {
    id: 'resume', label: 'Download résumé', keywords: 'resume cv curriculum vitae', kind: 'contact',
    href: links.resumeURL, download: true,
    analytics: contactAnalytics({ name: 'resume_download_clicked', placement: 'command_palette' }),
  },
  {
    id: 'email', label: 'Email me', keywords: 'contact mail hello', kind: 'contact',
    href: `mailto:${links.email}`,
    analytics: contactAnalytics({ name: 'contact_clicked', channel: 'email', placement: 'command_palette' }),
  },
  {
    id: 'github', label: 'View GitHub', keywords: 'profile code projects repositories', kind: 'contact',
    href: links.github,
    analytics: contactAnalytics({ name: 'outbound_link_clicked', destination_host: 'github.com', placement: 'command_palette' }),
  },
  {
    id: 'linkedin', label: 'Connect on LinkedIn', keywords: 'contact profile professional', kind: 'contact',
    href: links.linkedin,
    analytics: contactAnalytics({ name: 'contact_clicked', channel: 'linkedin', placement: 'command_palette' }),
  },
];

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function filterPaletteCommands(query: string): readonly PaletteCommand[] {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);

  return commands.filter((command) => {
    const searchableText = normalize(`${command.label} ${command.keywords}`);
    return terms.every((term) => searchableText.includes(term));
  }).sort((left, right) => left.label.localeCompare(right.label, 'en'));
}
