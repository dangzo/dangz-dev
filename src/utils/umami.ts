export const UMAMI_READY_EVENT = 'umami:ready';

export interface UmamiWindow extends Window {
  umami?: {
    track?: (eventName: string, eventData: Readonly<Record<string, string>>) => void | Promise<unknown>;
  };
}
