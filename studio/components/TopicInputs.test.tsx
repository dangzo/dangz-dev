import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InputProps, SlugInputProps } from 'sanity';
import { PrimaryTopicInput } from './PrimaryTopicInput';
import { TopicSlugInput } from './TopicSlugInput';

type Topic = Readonly<{ _id: string; displayName: string; description: string; editorialGuidance: string }>;
type Observer = Readonly<{ next: (topic: Topic | null) => void; error: () => void }>;
const store = vi.hoisted(() => ({ listenQuery: vi.fn(), useFormValue: vi.fn() }));
vi.mock('sanity', () => ({ useDocumentStore: () => store, useFormValue: store.useFormValue }));
vi.mock('@sanity/ui', async () => import('../test-support/mockUi'));
let observer: Observer;
const topic: Topic = { _id: 'topic-architecture', displayName: 'Architecture', description: 'Structure applications.', editorialGuidance: 'Choose for application boundaries.' };

beforeEach(() => {
  store.useFormValue.mockReset().mockReturnValue(topic._id);
  store.listenQuery.mockReset().mockReturnValue({ subscribe: (value: Observer) => {
    observer = value;

    return { unsubscribe: vi.fn() };
  } });
});

describe('topic authoring inputs', () => {
  it('keeps the standard reference picker and shows selected-topic guidance', () => {
    const props = { renderDefault: () => <button>Select primary topic</button> } as unknown as InputProps;
    render(<PrimaryTopicInput {...props} />);
    expect(screen.getByRole('button', { name: 'Select primary topic' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => observer.next(topic));
    expect(screen.getByText(topic.description)).toBeInTheDocument();
    expect(screen.getByText(topic.editorialGuidance)).toBeInTheDocument();
  });

  it('shows unavailable-topic and guidance error states', () => {
    const props = { renderDefault: () => <div>Picker</div> } as unknown as InputProps;
    render(<PrimaryTopicInput {...props} />);
    act(() => observer.next(null));
    expect(screen.getByText(/Publish this topic in Topics/)).toBeInTheDocument();
    act(() => observer.error());
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load topic guidance');
  });

  it('allows new-topic slug editing and locks an existing published slug', () => {
    const props = {
      renderDefault: (value: Readonly<{ readOnly?: boolean }>) => <input aria-label="Topic slug" readOnly={value.readOnly} />,
    } as unknown as SlugInputProps;
    render(<TopicSlugInput {...props} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    act(() => observer.next(null));
    expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
    act(() => observer.next(topic));
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    act(() => observer.error());
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    expect(screen.getByRole('alert')).toHaveTextContent('Could not verify the published slug');
  });
});
