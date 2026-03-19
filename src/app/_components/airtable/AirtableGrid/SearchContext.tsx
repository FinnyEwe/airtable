"use client";

import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from "react";

interface SearchMatch {
  rowId: string;
  columnId: string;
  matchIndex: number; // Which match within this cell (0-based)
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentMatchIndex: number;
  totalMatches: number;
  navigateToMatch: (index: number) => void;
  navigateNext: () => void;
  navigatePrev: () => void;
  isCurrentMatch: (rowId: string, columnId: string, matchIndex: number) => boolean;
  highlightMatches: (text: string, rowId: string, columnId: string) => React.ReactNode;
  scrollToCurrentMatch: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

// Default no-op context for when SearchProvider is not available
const defaultSearchContext: SearchContextType = {
  searchQuery: "",
  setSearchQuery: () => {},
  currentMatchIndex: 0,
  totalMatches: 0,
  navigateToMatch: () => {},
  navigateNext: () => {},
  navigatePrev: () => {},
  isCurrentMatch: () => false,
  highlightMatches: (text: string) => text,
  scrollToCurrentMatch: () => {},
};

export function useSearchContext() {
  const ctx = useContext(SearchContext);
  // Return default context if not within provider (graceful fallback)
  return ctx ?? defaultSearchContext;
}

interface SearchProviderProps {
  children: React.ReactNode;
  tableData: Array<{ id: string; [key: string]: unknown }>;
  dataColumns: Array<{ id: string; name: string; type: string }>;
}

export function SearchProvider({ children, tableData, dataColumns }: SearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const currentMatchRef = useRef<HTMLElement | null>(null);

  // Calculate all matches across all cells
  const matches = useMemo<SearchMatch[]>(() => {
    if (!searchQuery.trim()) return [];

    const allMatches: SearchMatch[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    for (const row of tableData) {
      for (const col of dataColumns) {
        const cellValue = String(row[col.id] ?? "");
        if (!cellValue) continue;

        const lowerValue = cellValue.toLowerCase();
        let startIndex = 0;
        let matchIndexInCell = 0;

        while (true) {
          const foundIndex = lowerValue.indexOf(lowerQuery, startIndex);
          if (foundIndex === -1) break;

          allMatches.push({
            rowId: row.id,
            columnId: col.id,
            matchIndex: matchIndexInCell,
          });

          startIndex = foundIndex + 1;
          matchIndexInCell++;
        }
      }
    }

    return allMatches;
  }, [searchQuery, tableData, dataColumns]);

  const totalMatches = matches.length;

  // Reset current match when search query changes
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchQuery]);

  const navigateToMatch = useCallback((index: number) => {
    if (index >= 0 && index < totalMatches) {
      setCurrentMatchIndex(index);
    }
  }, [totalMatches]);

  const navigateNext = useCallback(() => {
    setCurrentMatchIndex((current) => 
      current < totalMatches - 1 ? current + 1 : current
    );
  }, [totalMatches]);

  const navigatePrev = useCallback(() => {
    setCurrentMatchIndex((current) => 
      current > 0 ? current - 1 : 0
    );
  }, []);

  const isCurrentMatch = useCallback((rowId: string, columnId: string, matchIndex: number) => {
    if (!matches.length) return false;
    const currentMatch = matches[currentMatchIndex];
    return (
      currentMatch?.rowId === rowId &&
      currentMatch?.columnId === columnId &&
      currentMatch?.matchIndex === matchIndex
    );
  }, [matches, currentMatchIndex]);

  const scrollToCurrentMatch = useCallback(() => {
    if (currentMatchRef.current) {
      currentMatchRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, []);

  // Scroll to match when currentMatchIndex changes
  useEffect(() => {
    if (totalMatches > 0) {
      // Small delay to allow render
      setTimeout(scrollToCurrentMatch, 50);
    }
  }, [currentMatchIndex, scrollToCurrentMatch, totalMatches]);

  const highlightMatches = useCallback(
    (text: string, rowId: string, columnId: string): React.ReactNode => {
      if (!searchQuery.trim()) return text;

      const lowerText = text.toLowerCase();
      const lowerQuery = searchQuery.toLowerCase();
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let matchIndexInCell = 0;

      while (true) {
        const index = lowerText.indexOf(lowerQuery, lastIndex);
        if (index === -1) break;

        // Add text before match
        if (index > lastIndex) {
          parts.push(text.slice(lastIndex, index));
        }

        // Add highlighted match
        const matchText = text.slice(index, index + searchQuery.length);
        const isCurrent = isCurrentMatch(rowId, columnId, matchIndexInCell);

        parts.push(
          <span
            key={`${rowId}-${columnId}-${matchIndexInCell}`}
            ref={isCurrent ? (el) => { currentMatchRef.current = el; } : undefined}
            className={
              isCurrent
                ? "bg-orange-400 text-black font-medium"
                : "bg-yellow-200 text-black"
            }
          >
            {matchText}
          </span>
        );

        lastIndex = index + searchQuery.length;
        matchIndexInCell++;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
      }

      return parts.length > 0 ? parts : text;
    },
    [searchQuery, isCurrentMatch]
  );

  const value: SearchContextType = {
    searchQuery,
    setSearchQuery,
    currentMatchIndex,
    totalMatches,
    navigateToMatch,
    navigateNext,
    navigatePrev,
    isCurrentMatch,
    highlightMatches,
    scrollToCurrentMatch,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}
