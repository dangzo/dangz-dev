import { createRef } from 'react';
import { act, renderHook } from '@testing-library/react';

import { useSearchKeyboardNavigation } from './useSearchKeyboardNavigation';

const itemIds = ['post:alpha', 'command:theme'];

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

function setup(initial = { isOpen: true, query: '', isLoading: false, itemIds }) {
  const input = document.createElement('input');
  input.value = initial.query;
  document.body.appendChild(input);
  const inputRef = createRef<HTMLInputElement>();
  inputRef.current = input;
  input.focus();
  const onQueryChange = vi.fn();
  const hook = renderHook((props) => useSearchKeyboardNavigation({ ...props, inputRef, onQueryChange }), {
    initialProps: initial,
  });
  const anchor = document.createElement('a');
  const button = document.createElement('button');
  const activatePost = vi.fn();
  const activateCommand = vi.fn();
  anchor.href = '#post';
  document.body.append(anchor, button);
  anchor.addEventListener('click', (event) => { event.preventDefault(); activatePost(); });
  button.addEventListener('click', activateCommand);
  hook.result.current.itemRefs.current = [anchor, button];
  const press = (key: string, target: HTMLElement = input) => {
    act(() => { target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); });
  };
  return { ...hook, input, anchor, button, activatePost, activateCommand, press, onQueryChange };
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('useSearchKeyboardNavigation', () => {
  it('starts without a selected row and wraps through anchors and buttons', () => {
    const { result, press } = setup();
    expect(result.current.activeItemIndex).toBe(-1);
    press('ArrowDown');
    expect(result.current.activeItemIndex).toBe(0);
    expect(document.activeElement).toBe(result.current.itemRefs.current[0]);
    press('ArrowDown');
    expect(result.current.activeItemIndex).toBe(1);
    expect(document.activeElement).toBe(result.current.itemRefs.current[1]);
    press('ArrowDown');
    expect(result.current.activeItemIndex).toBe(0);
    press('ArrowUp');
    expect(result.current.activeItemIndex).toBe(1);
  });

  it('selects the final row with ArrowUp from the input', () => {
    const { result, press } = setup();
    press('ArrowUp');
    expect(result.current.activeItemIndex).toBe(1);
  });

  it('ignores keyboard navigation while closed or when no items exist', () => {
    const { result, rerender, press } = setup({ isOpen: false, query: '', isLoading: false, itemIds });
    press('ArrowDown');
    expect(result.current.activeItemIndex).toBe(-1);
    rerender({ isOpen: true, query: '', isLoading: false, itemIds: [] });
    press('ArrowDown');
    press('Enter');
    expect(result.current.activeItemIndex).toBe(-1);
  });

  it('activates the first rendered control from input Enter', () => {
    const { press, activatePost, activateCommand } = setup();
    press('Enter');
    expect(activatePost).toHaveBeenCalledOnce();
    expect(activateCommand).not.toHaveBeenCalled();
  });

  it('activates a highlighted command exactly once', () => {
    const { press, activatePost, activateCommand } = setup();
    press('ArrowUp');
    press('Enter');
    expect(activateCommand).toHaveBeenCalledOnce();
    expect(activatePost).not.toHaveBeenCalled();
  });

  it('requires explicit selection during a pending search', () => {
    const { press, activatePost, activateCommand } = setup({ isOpen: true, query: 'theme', isLoading: true, itemIds });
    press('Enter');
    expect(activatePost).not.toHaveBeenCalled();
    press('ArrowUp');
    press('Enter');
    expect(activateCommand).toHaveBeenCalledOnce();
  });

  it('leaves focused controls to their native Enter activation', () => {
    const { press, anchor, activatePost } = setup();
    document.body.appendChild(anchor);
    anchor.href = '#post';
    anchor.focus();
    press('Enter', anchor);
    expect(activatePost).not.toHaveBeenCalled();
  });

  it.each(['anchor', 'button'] as const)('returns focus and inserts typing from a focused %s', (control) => {
    const state = setup({ isOpen: true, query: 'testing', isLoading: false, itemIds });
    state[control].focus();
    state.press('!', state[control]);
    expect(state.input).toHaveFocus();
    expect(state.onQueryChange).toHaveBeenCalledExactlyOnceWith('testing!');
    expect(state.result.current.activeItemIndex).toBe(-1);
  });

  it('returns focus and applies Backspace to the input selection', () => {
    const { input, anchor, press, onQueryChange } = setup({ isOpen: true, query: 'testing', isLoading: false, itemIds });
    input.setSelectionRange(0, 4);
    anchor.focus();
    press('Backspace', anchor);
    expect(input).toHaveFocus();
    expect(onQueryChange).toHaveBeenCalledExactlyOnceWith('ing');
  });

  it('keeps modifier shortcuts on focused rows native', () => {
    const { anchor, onQueryChange } = setup();
    anchor.focus();
    act(() => {
      anchor.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true }));
    });
    expect(anchor).toHaveFocus();
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it('resets selection when the query, item collection, or open state changes', () => {
    const { press, result, rerender } = setup();
    press('ArrowUp');
    rerender({ isOpen: true, query: 'theme', isLoading: false, itemIds });
    expect(result.current.activeItemIndex).toBe(-1);
    press('ArrowUp');
    rerender({ isOpen: true, query: 'theme', isLoading: false, itemIds: ['command:theme'] });
    expect(result.current.activeItemIndex).toBe(-1);
    press('ArrowDown');
    rerender({ isOpen: false, query: 'theme', isLoading: false, itemIds: ['command:theme'] });
    rerender({ isOpen: true, query: 'theme', isLoading: false, itemIds: ['command:theme'] });
    expect(result.current.activeItemIndex).toBe(-1);
  });
});
