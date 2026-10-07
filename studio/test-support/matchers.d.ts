import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import 'vitest';

// jest-dom's Vitest declaration still uses the pre-v5 Assertion generics.
declare module 'vitest' {
  // eslint-disable-next-line -- Module augmentation requires an interface; root and Studio use different rule prefixes.
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown>
    extends TestingLibraryMatchers<T, R> {}
}
