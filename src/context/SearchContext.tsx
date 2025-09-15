import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface SearchContextValue {
  query: string;
  setQuery: (q: string) => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQueryState] = useState('');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('search:q') : null;
    if (saved) setQueryState(saved);
  }, []);

  const setQuery = (q: string) => {
    setQueryState(q);
    if (typeof window !== 'undefined') {
      localStorage.setItem('search:q', q);
    }
  };

  const value = useMemo(() => ({ query, setQuery }), [query]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
