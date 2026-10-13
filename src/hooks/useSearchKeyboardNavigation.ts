'use client';

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

type SearchItemElement = HTMLAnchorElement | HTMLButtonElement;

type UseSearchKeyboardNavigationOptions = Readonly<{
  isOpen: boolean;
  itemIds: readonly string[];
  query: string;
  isLoading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
}>;

export function useSearchKeyboardNavigation({
  isOpen,
  itemIds,
  query,
  isLoading,
  inputRef,
  onQueryChange,
}: UseSearchKeyboardNavigationOptions) {
  const [selection, setSelection] = useState<Readonly<{ listKey: string; index: number }> | null>(null);
  const itemRefs = useRef<Array<SearchItemElement | null>>([]);
  const pendingCaretRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const caret = pendingCaretRef.current;
    pendingCaretRef.current = null;
    const input = inputRef.current;
    if (caret !== null && input && document.activeElement === input) {
      input.setSelectionRange(caret, caret);
    }
  }, [query, inputRef]);
  const listKey = JSON.stringify([isOpen, query, itemIds]);
  if (selection !== null && selection.listKey !== listKey) {
    setSelection(null);
  }

  const activeItemIndex = selection?.listKey === listKey && selection.index < itemIds.length
    ? selection.index
    : -1;

  const setActiveItemIndex = (index: number) => {
    setSelection({ listKey, index });
  };

  useEffect(() => {
    if (activeItemIndex >= 0) {
      itemRefs.current[activeItemIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeItemIndex, listKey]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const focusedIndex = itemRefs.current.findIndex((item) => item !== null && item === target);
      const fromInput = target === inputRef.current;
      if ((!fromInput && focusedIndex < 0) || event.isComposing || itemIds.length === 0) {
        return;
      }

      const isQueryEdit = (event.key.length === 1 || event.key === 'Backspace')
        && !event.ctrlKey && !event.metaKey && !event.altKey;
      if (focusedIndex >= 0 && isQueryEdit) {
        const input = inputRef.current;
        if (!input) {
          return;
        }

        event.preventDefault();
        const start = input.selectionStart ?? query.length;
        const end = input.selectionEnd ?? start;
        const prefix = query.slice(0, start);
        const deletedLength = event.key === 'Backspace' && start === end
          ? (Array.from(prefix).pop()?.length ?? 0)
          : 0;
        const editStart = start - deletedLength;
        const inserted = event.key === 'Backspace' ? '' : event.key;
        const nextQuery = query.slice(0, editStart) + inserted + query.slice(end);
        const nextCaret = editStart + inserted.length;
        setSelection(null);
        input.focus({ preventScroll: true });
        if (nextQuery === query) {
          input.setSelectionRange(nextCaret, nextCaret);
        } else {
          pendingCaretRef.current = nextCaret;
          onQueryChange(nextQuery);
        }
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const currentIndex = focusedIndex >= 0 ? focusedIndex : activeItemIndex;
        const nextIndex = event.key === 'ArrowDown'
          ? (currentIndex + 1) % itemIds.length
          : (currentIndex <= 0 ? itemIds.length - 1 : currentIndex - 1);
        setSelection({ listKey, index: nextIndex });
        itemRefs.current[nextIndex]?.focus({ preventScroll: true });
        return;
      }

      // Focused anchors/buttons keep native activation, including their targets and downloads.
      if (event.key === 'Enter' && fromInput && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        event.preventDefault();
        if (activeItemIndex < 0 && isLoading) {
          return;
        }

        itemRefs.current[activeItemIndex >= 0 ? activeItemIndex : 0]?.click();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, itemIds.length, listKey, activeItemIndex, isLoading, inputRef, query, onQueryChange]);

  return { activeItemIndex, setActiveItemIndex, itemRefs };
}
