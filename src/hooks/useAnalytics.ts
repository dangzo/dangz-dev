import { sendGAEvent } from '@next/third-parties/google';

interface AnalyticsEvent {
  page: string;
  action?: string;
  category: string;
  value: string;
}

function useAnalytics() {
  const sendEvent = ({ page, action = 'click', category, value }: AnalyticsEvent) => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    sendGAEvent({
      page,
      action,
      category,
      value,
    });
  };

  return { sendEvent };
}

export default useAnalytics;