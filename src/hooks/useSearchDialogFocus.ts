'use client';

import { useEffect, type RefObject } from 'react';

type SearchDialogFocusOptions = Readonly<{
  isOpen: boolean;
  dialogRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
}>;

export function useSearchDialogFocus({ isOpen, dialogRef, inputRef }: SearchDialogFocusOptions) {
  useEffect(() => {
    const dialog = dialogRef.current;
    const panel = dialog?.querySelector<HTMLElement>('[data-search-panel]');
    if (!isOpen || !dialog || !panel) {
      return;
    }

    const previousFocus = document.activeElement;
    const siblings = Array.from(document.body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== dialog)
      .map((element) => ({ element, inert: element.inert }));
    siblings.forEach(({ element }) => { element.inert = true; });

    const keepFocusInDialog = (event: FocusEvent) => {
      if (event.target instanceof Node && !panel.contains(event.target)) {
        inputRef.current?.focus();
      }
    };

    const trapTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const controls = Array.from(panel.querySelectorAll<HTMLElement>('input, button, a[href]'))
        .filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('focusin', keepFocusInDialog);
    document.addEventListener('keydown', trapTab);
    return () => {
      document.removeEventListener('focusin', keepFocusInDialog);
      document.removeEventListener('keydown', trapTab);
      siblings.forEach(({ element, inert }) => { element.inert = inert; });
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [isOpen, dialogRef, inputRef]);
}
