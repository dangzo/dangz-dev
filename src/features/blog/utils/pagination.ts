export const PAGE_SIZE = 8;

const CANONICAL_POSITIVE_INTEGER = /^[1-9]\d*$/;

export function parsePageParam(raw: string): number | null {
  if (!CANONICAL_POSITIVE_INTEGER.test(raw)) {
    return null;
  }

  return Number(raw);
}

export function getTotalPages(count: number, pageSize: number = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(count / pageSize));
}
