'use client';

import { createContext, useContext } from 'react';

export interface SidebarMobileContextValue {
  close: () => void;
  isOpen: boolean;
}

export const SidebarMobileContext = createContext<SidebarMobileContextValue | null>(null);

export function useSidebarMobileClose() {
  return useContext(SidebarMobileContext)?.close;
}
