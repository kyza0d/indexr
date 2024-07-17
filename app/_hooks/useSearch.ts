import { useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { flattenForSearch } from '@/utils/data';

const MAX_QUERY_LENGTH = 100;
const MAX_RESULTS = 1000; // You can adjust this value as needed

/**
 * A custom hook that provides search functionality for various data structures.
 * This hook uses Fuse.js for fuzzy searching and supports both array and object data.
 * It handles data preparation, search execution, and result formatting.
 * 
 * @param data - The dataset to search through (can be an array or an object)
 * @returns An object containing the search function
 */
export const useSearch = (data: any[] | Record<string, any>) => {
  /**
   * Creates and memoizes a Fuse instance for efficient searching.
   * This memo prepares the data for searching by flattening nested structures
   * and configuring Fuse.js with appropriate options.
   */
  const fuse = useMemo(() => {
    if (!data || (Array.isArray(data) && data.length === 0)) return null;

    // Prepare data for Fuse.js by flattening and indexing
    const flattenedData = Array.isArray(data)
      ? data.map((item, index) => ({ ...flattenForSearch(item), __originalIndex: index }))
      : Object.entries(data).map(([key, value], index) => ({
        id: key,
        ...flattenForSearch(value),
        __originalIndex: index
      }));

    // Extract all unique keys from the flattened data for Fuse.js configuration
    const keys = Array.from(new Set(flattenedData.flatMap(Object.keys)));

    // Initialize and return Fuse instance
    return new Fuse(flattenedData, {
      keys,
      threshold: 0.32,
      includeMatches: true,
      ignoreLocation: true,
      useExtendedSearch: true,
    });
  }, [data]);

  /**
   * Performs a search on the data using the provided query and optional search key.
   * This function handles different search scenarios, including empty queries and key-specific searches.
   * It also formats the results to include both the original item structure and match information.
   * 
   * @param query - The search query string
   * @param searchKey - Optional key to limit the search to a specific field
   * @returns An array of search results with original items and match information
   */
  const search = useCallback((query: string, searchKey: string | null) => {
    if (!fuse) return [];

    // Trim and limit query length for performance
    const trimmedQuery = query.trim().slice(0, MAX_QUERY_LENGTH);

    // If query is empty, return all items
    if (trimmedQuery.length === 0) {
      return Array.isArray(data)
        ? data.map(item => ({ item }))
        : Object.entries(data).map(([key, value]) => ({ item: { id: key, ...value } }));
    }

    // Configure search options
    const options: Fuse.IFuseOptions<any> = {
      limit: MAX_RESULTS,
      useExtendedSearch: true
    };

    if (searchKey) {
      options.keys = [searchKey];
    }

    // Perform the search
    const results = fuse.search(trimmedQuery, options);

    // Format and return the results
    return results.map(result => ({
      item: Array.isArray(data)
        ? data[result.item.__originalIndex]
        : { id: Object.keys(data)[result.item.__originalIndex], ...Object.values(data)[result.item.__originalIndex] },
      matches: searchKey
        ? result.matches?.filter(match => match.key === searchKey)
        : result.matches
    }));
  }, [fuse, data]);

  return { search };
};
