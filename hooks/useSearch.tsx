import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

import useRetrieveData from '@/hooks/useRetrieveData';
import useDataHandling from '@/hooks/useDataHandling';
import { useSettings } from '@/components/Settings/Context';

const useSearch = (itemsFile: string) => {
  const [names, setNames] = useState<any[]>([]);
  const [query, setQuery] = useState<string>('');

  const { loadItems } = useRetrieveData(itemsFile);
  const { loadNames } = useDataHandling(loadItems, config, setNames);

  const { config } = useSettings();

  const [displayedItemsCount, setDisplayedItemsCount] = useState<number>(200);

  const fuseOptions = { keys: [config.searchKey || 'id'], threshold: 0.2, includeMatches: true };
  const fuse = useMemo(() => new Fuse<any[]>([], fuseOptions), []);

  useEffect(() => {
    loadNames();
  }, []);

  useEffect(() => {
    if (names.length > 0) {
      fuse.setCollection(names);
      fuse.setOptions({ keys: [config.searchKey || 'id'] });
    }
  }, [names, config.searchKey, fuse]);

  const loadMoreItems = () => setDisplayedItemsCount(prevCount => prevCount + 100);

  const results = useMemo(() => {
    if (query.length < 2) return names.slice(0, displayedItemsCount);
    return fuse.search(query).map(result => result.item).filter(Boolean).slice(0, displayedItemsCount);
  }, [query, displayedItemsCount, names, fuse]);

  return { names, query, setQuery, displayedItemsCount, setDisplayedItemsCount, loadMoreItems, results };
};

export default useSearch;
