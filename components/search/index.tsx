"use client";

import { useRef, useState, useEffect, ChangeEvent, useMemo } from "react";

import useSettings from "@/hooks/useSettings";

import SearchInput from "@/components/search/input";
import { ResultsList, ResultItem } from "@/components/search/results";

import useRetrieveData from "@/hooks/useRetrieveData";
import useDataHandling from "@/hooks/useDataHandling";

import { debounce } from "@/utils";

import { FiSettings } from "react-icons/fi";

import Fuse from "fuse.js";

import SettingsWindow from "@/components/settings/window";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Item {
  [key: string]: string;
}

interface LoadMoreProps {
  count: number;
  loadMoreItems: () => void;
  displayedItemsCount: number;
}

const LoadMore: React.FC<LoadMoreProps> = ({ count, loadMoreItems, displayedItemsCount }) => {
  if (count > displayedItemsCount) {
    return (
      <nav id="load-more" key="load-more" className="my-6 flex w-full">
        <p key="more">{`${count - displayedItemsCount} more items...`}</p>
        <button onClick={loadMoreItems} key="load-more-button" className="mx-auto rounded-lg px-6 py-2">
          Load more
        </button>
      </nav>
    );
  }
};

const Search = ({ itemsFile }: { itemsFile: string }) => {
  const fuse = useRef<Fuse<Item> | null>(null);
  const { config, setConfig } = useSettings();
  const [names, setNames] = useState<Item[]>([]);

  const { loadItems, error } = useRetrieveData(itemsFile);
  const { uniqueKeys, loadNames, firstKey } = useDataHandling(loadItems, config, setConfig, setNames);

  const [searchKey, setSearchKey] = useState<string | null>(config.searchKey);

  useEffect(() => {
    setSearchKey(config.searchKey);
    const newConfig = { ...config, searchKey: searchKey };
    setConfig(newConfig);
  }, [config.searchKey, firstKey])

  useEffect(() => {
    fuse.current = new Fuse(names, {
      keys: [searchKey === null ? String(firstKey) : String(searchKey)],
      threshold: 0.2,
      includeMatches: true,
    });
  }, [names, searchKey, firstKey]);

  useEffect(() => {
    loadNames();
  }, []);


  const displayedItems = 200;
  const [displayedItemsCount, setDisplayedItemsCount] = useState<number>(displayedItems);

  const loadMoreItems = () => {
    setDisplayedItemsCount(displayedItemsCount + 100);
  };

  const [query, setQuery] = useState("");

  const handleInputChange = debounce((event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);
  }, 200);

  const renderresults: JSX.Element[] = [];

  const renderResults = useMemo(() => {
    const baseArray = query && query.length >= 2 ? fuse.current?.search(query) ?? [] : names;
    return baseArray.slice(0, displayedItemsCount).map((entry) => (
      <ResultItem
        item={entry.item}
        result={entry}
        config={config}
        query={query}
        searchKey={searchKey as string}
      />
    ));
  }, [query, displayedItemsCount, names, config, searchKey]);

  let loadMoreElement = null;

  if (query && query.length >= 2) {
    const results = fuse.current?.search(query) ?? [];
    for (let i = 0; i < Math.min(displayedItemsCount, results.length); i++) {
      const result = results[i];
      const item = result.item;
      renderresults.push(
        <ResultItem
          key={result.item.id}
          item={item}
          result={result}
          config={config}
          query={query}
          searchKey={searchKey as string}
        />
      );
    }
    loadMoreElement = (
      <LoadMore
        count={results.length}
        loadMoreItems={loadMoreItems}
        displayedItemsCount={displayedItemsCount}
      />
    );
  } else {
    const namesToRender = names.slice(0, displayedItemsCount);
    for (let i = 0; i < namesToRender.length; i++) {
      const name = namesToRender[i];
      renderresults.push(
        <ResultItem key={name.id} item={name} config={config} query={query} searchKey={searchKey as string} />
      );
    }
    loadMoreElement = (
      <LoadMore
        count={names.length}
        loadMoreItems={loadMoreItems}
        displayedItemsCount={displayedItemsCount}
      />
    );
  }

  const [showSettings, setShowSettings] = useState(false);

  const handleSearchKeyChange = (newSearchKey: string) => {
    setSearchKey(newSearchKey);
    const newConfig = { ...config, searchKey: newSearchKey };
    setConfig(newConfig);
  }

  const searchBarRef = useRef<HTMLDivElement | null>(null);

  return (
    <main className={`px-4`}>
      <div className="flex flex-col gap-4">
        <div className="mb-6 pt-8">
          Fetching from <span className="inline rounded-md p-2">{itemsFile}</span>
        </div>
        {error && <div className="error-message">Error: {error.message}</div>}

        <div className="flex justify-stretch gap-2" id="search-bar" ref={searchBarRef}>
          <Select onValueChange={handleSearchKeyChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a key" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {config.keys &&
                  Array.from(uniqueKeys)
                    .filter((key) => config.keys[key])
                    .map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <SearchInput handleInputChange={handleInputChange} />
        </div>
        <ResultsList results={renderresults} />
        <div>{loadMoreElement}</div>
        <FiSettings
          className="settings-icon fixed right-10 top-10"
          onClick={() => setShowSettings(!showSettings)}
        />
        {showSettings && <SettingsWindow onClose={() => setShowSettings(false)} />}
      </div>
    </main >
  );
};

export default Search;
