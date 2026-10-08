'use client';

import { useEffect, type RefObject } from 'react';

type ViewerIsolationOptions = Readonly<{
  dialogRef: RefObject<HTMLDivElement | null>;
  closeRef: RefObject<HTMLButtonElement | null>;
  trigger: HTMLButtonElement;
  onClose: () => void;
}>;

const BODY_PROPERTIES = ['position', 'top', 'left', 'right', 'width', 'overflow', 'paddingRight'] as const;

export default function useImageViewerIsolation({ dialogRef, closeRef, trigger, onClose }: ViewerIsolationOptions) {
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const { body, documentElement } = document;
    const { scrollX, scrollY } = window;
    const previousBodyStyles = BODY_PROPERTIES.map(property => [property, body.style[property]] as const);
    const previousOverflow = documentElement.style.overflow;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const paddingRight = parseFloat(getComputedStyle(body).paddingRight) || 0;

    body.style.position = 'fixed';
    body.style.top = `${-scrollY}px`;
    body.style.left = `${-scrollX}px`;
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    body.style.paddingRight = `${paddingRight + scrollbarWidth}px`;
    documentElement.style.overflow = 'hidden';

    closeRef.current?.focus({ preventScroll: true });

    const background = Array.from(body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement
        && element !== dialog
        && !['SCRIPT', 'STYLE', 'LINK'].includes(element.tagName))
      .map(element => ({
        element,
        inert: element.getAttribute('inert'),
        ariaHidden: element.getAttribute('aria-hidden'),
      }));

    for (const { element } of background) {
      element.setAttribute('inert', '');
      element.setAttribute('aria-hidden', 'true');
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        onClose();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ));
      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
      const nextIndex = event.shiftKey
        ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
        : (currentIndex + 1) % focusable.length;

      event.preventDefault();
      event.stopImmediatePropagation();
      focusable[nextIndex]?.focus({ preventScroll: true });
    };

    const onFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) {
        closeRef.current?.focus({ preventScroll: true });
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focusin', onFocusIn);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusIn);

      for (const { element, inert, ariaHidden } of background) {
        if (inert === null) {
          element.removeAttribute('inert');
        } else {
          element.setAttribute('inert', inert);
        }

        if (ariaHidden === null) {
          element.removeAttribute('aria-hidden');
        } else {
          element.setAttribute('aria-hidden', ariaHidden);
        }
      }

      for (const [property, value] of previousBodyStyles) {
        body.style[property] = value;
      }

      documentElement.style.overflow = previousOverflow;

      // The site's smooth scrolling must not animate restoration after unlocking the body.
      const previousScrollBehavior = documentElement.style.scrollBehavior;
      documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(scrollX, scrollY);
      if (trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      }
      documentElement.style.scrollBehavior = previousScrollBehavior;
    };
  }, [dialogRef, closeRef, trigger, onClose]);
}
