import { sendGAEvent } from '@next/third-parties/google';

function useAnalytics() {
  const sendEvent = (action: string, category: string, label: string) => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    sendGAEvent({
      action,
      category,
      label,
    });
  };

  return { sendEvent };
}

export default useAnalytics;