export type ContactPlacement = 'home' | 'about_intro' | 'about_journey' | 'about_contact' | 'footer';

type ContactAnalyticsEvent =
  | Readonly<{ name: 'contact_clicked'; channel: 'email' | 'linkedin'; placement: ContactPlacement }>
  | Readonly<{ name: 'resume_download_clicked'; placement: ContactPlacement }>
  | Readonly<{ name: 'outbound_link_clicked'; destination_host: 'github.com'; placement: ContactPlacement }>;

export type ContactAnalyticsAttributes = Readonly<{
  'data-umami-event': ContactAnalyticsEvent['name'];
  'data-umami-event-placement': ContactPlacement;
  'data-umami-event-channel'?: 'email' | 'linkedin';
  'data-umami-event-destination_host'?: 'github.com';
}>;

export function contactAnalytics(event: ContactAnalyticsEvent): ContactAnalyticsAttributes {
  const attributes = {
    'data-umami-event': event.name,
    'data-umami-event-placement': event.placement,
  };

  switch (event.name) {
  case 'contact_clicked': {
    return {
      ...attributes,
      'data-umami-event-channel': event.channel,
    };
  }
  case 'outbound_link_clicked': {
    return {
      ...attributes,
      'data-umami-event-destination_host': event.destination_host,
    };
  }
  case 'resume_download_clicked': {
    return attributes;
  }
  }
}
