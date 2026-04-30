'use client';

import { useEffect, useRef } from 'react';
import SearchModal from './SearchModal';
import { useBlogSearch } from '@/features/blog/hooks/useBlogSearch';

type SearchModalBridgeProps = {
  openRequest: number;
  onOpenChange: (isOpen: boolean) => void;
};

const SearchModalBridge = ({ openRequest, onOpenChange }: SearchModalBridgeProps) => {
  const {
    isOpen,
    query,
    results,
    isLoading,
    inputRef,
    openSearch,
    closeSearch,
    setQuery,
  } = useBlogSearch();
  const lastHandledOpenRequest = useRef(0);

  useEffect(() => {
    if (openRequest > lastHandledOpenRequest.current) {
      lastHandledOpenRequest.current = openRequest;
      openSearch();
    }
  }, [openRequest, openSearch]);

  useEffect(() => {
    onOpenChange(isOpen);
  }, [isOpen, onOpenChange]);

  return (
    <SearchModal
      isOpen={isOpen}
      query={query}
      results={results}
      isLoading={isLoading}
      inputRef={inputRef}
      onQueryChange={setQuery}
      onClose={closeSearch}
    />
  );
};

export default SearchModalBridge;