import React, { useState, useCallback, useEffect } from 'react';
import { useSearch } from '../_hooks/useSearch';
import { debounce } from 'lodash';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * Props interface for the Search component.
 * @property {any[] | Record<string, any>} data - The dataset to search through.
 * @property {function} onSearchResults - Callback function to handle search results.
 */
interface SearchProps {
  data: any[] | Record<string, any>;
  onSearchResults: (results: any[], query: string, key: string | null) => void;
}

/**
 * Search component that provides a user interface for searching through data.
 * This component renders a search input and a dropdown for selecting specific keys to search.
 * It uses the useSearch hook for performing searches and manages its own state for query and selected key.
 */
const Search: React.FC<SearchProps> = ({ data, onSearchResults }) => {
  const [query, setQuery] = useState('');
  const [searchKey, setSearchKey] = useState<string | null>(null);
  const { search } = useSearch(data);

  /**
   * Recursively extracts unique keys from an object, including nested objects and arrays.
   * This function is crucial for generating the list of searchable keys in the dropdown.
   * 
   * @param obj - The object to extract keys from
   * @param prefix - The current key prefix for nested objects (used in recursion)
   * @returns An array of unique keys
   */
  const extractUniqueKeys = (obj: any, prefix = ''): string[] => {
    let keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      keys.push(newKey);

      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          // For arrays, we add numbered keys (e.g., paymentvalue0, paymentvalue1)
          value.forEach((_, index) => {
            keys.push(`${newKey}${index}`);
          });
        } else {
          // For nested objects, we recursively extract keys
          keys = keys.concat(extractUniqueKeys(value, newKey));
        }
      }
    }

    return keys;
  };

  /**
   * Memoized computation of unique keys from the data.
   * This ensures that the list of searchable keys is only recalculated when the data changes.
   */
  const uniqueKeys = React.useMemo(() => {
    const allKeys = new Set<string>();

    if (Array.isArray(data)) {
      data.forEach(item => {
        extractUniqueKeys(item).forEach(key => allKeys.add(key));
      });
    } else {
      extractUniqueKeys(data).forEach(key => allKeys.add(key));
    }

    return Array.from(allKeys).sort();
  }, [data]);

  /**
   * Performs a search using the current query and selected key.
   * This function is called whenever the search parameters change.
   */
  const performSearch = useCallback((searchQuery: string, key: string | null) => {
    console.log('Performing search:', searchQuery, key);
    const results = search(searchQuery, key);
    onSearchResults(results, searchQuery, key);
  }, [search, onSearchResults]);

  /**
   * Debounced version of the search function to prevent excessive API calls.
   * This improves performance by reducing the number of searches performed during rapid typing.
   */
  const debouncedSearch = useCallback(
    debounce(performSearch, 300),
    [performSearch]
  );

  /**
   * Effect hook to trigger a search whenever the query or selected key changes.
   * This ensures that the search results are always up-to-date with the current search parameters.
   */
  useEffect(() => {
    debouncedSearch(query, searchKey);
  }, [debouncedSearch, query, searchKey]);

  /**
   * Handles changes to the search input field.
   * Updates the query state, which in turn triggers a new search.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
  };

  /**
   * Handles changes to the selected search key.
   * Updates the searchKey state, which in turn triggers a new search.
   */
  const handleKeyChange = (value: string) => {
    const newSearchKey = value === 'all' ? null : value;
    setSearchKey(newSearchKey);
  };

  return (
    <div className="mt-6 space-y-4">
      <Select onValueChange={handleKeyChange} defaultValue="all">
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a key to search" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Keys</SelectItem>
          {uniqueKeys.map((key) => (
            <SelectItem key={key} value={key}>
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search..."
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default Search;
