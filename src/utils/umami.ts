export const UMAMI_READY_EVENT = 'umami:ready';

export type UmamiPayload = Readonly<Record<string, unknown>>;

interface UmamiTrack {
  (eventName: string, eventData: Readonly<Record<string, string | number>>): void | Promise<unknown>;
  (payload: (defaults: UmamiPayload) => UmamiPayload): void | Promise<unknown>;
}

export interface UmamiWindow extends Window {
  umami?: {
    track?: UmamiTrack;
  };
}
