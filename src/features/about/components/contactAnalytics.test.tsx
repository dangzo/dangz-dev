import { render, screen } from '@testing-library/react';

import { links } from '@/data/siteMetadata';
import IntroCTAs from './IntroCTAs';
import LetsTalkFrontend from './LetsTalkFrontend';
import ResumeDownloadButton from './ResumeDownloadButton';

vi.mock('next/link', () => import('@/tests/unit/mocks/nextLink'));

describe('About contact analytics', () => {
  const sections = [
    {
      component: IntroCTAs,
      placement: 'about_intro',
      controls: [
        { label: 'Download my resume', href: links.resumeURL, event: 'resume_download_clicked', properties: {} },
        { label: 'Connect on LinkedIn', href: links.linkedin, event: 'contact_clicked', properties: { channel: 'linkedin' } },
      ],
    },
    {
      component: ResumeDownloadButton,
      placement: 'about_journey',
      controls: [
        { label: 'Download my resume', href: links.resumeURL, event: 'resume_download_clicked', properties: {} },
      ],
    },
    {
      component: LetsTalkFrontend,
      placement: 'about_contact',
      controls: [
        { label: 'Email me', href: `mailto:${links.email}`, event: 'contact_clicked', properties: { channel: 'email' } },
        { label: 'Connect on LinkedIn', href: links.linkedin, event: 'contact_clicked', properties: { channel: 'linkedin' } },
        { label: 'View GitHub', href: links.github, event: 'outbound_link_clicked', properties: { destination_host: 'github.com' } },
      ],
    },
  ];

  for (const { component, placement, controls } of sections) {
    it(`renders the ${placement} contract without changing link behavior`, async () => {
      render(await component());

      expect(screen.getAllByRole('link')).toHaveLength(controls.length);

      for (const { label, href, event, properties } of controls) {
        const link = screen.getByRole('link', { name: label });
        const analytics = Object.fromEntries(link.getAttributeNames()
          .filter((attribute) => attribute.startsWith('data-umami-event-'))
          .map((attribute) => [attribute.slice('data-umami-event-'.length), link.getAttribute(attribute)]));

        expect(link).toHaveAttribute('href', href);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('data-umami-event', event);
        expect(analytics).toEqual({ placement, ...properties });

        if (event === 'resume_download_clicked') {
          expect(link).toHaveAttribute('download', '');
        } else {
          expect(link).not.toHaveAttribute('download');
        }
      }
    });
  }
});
