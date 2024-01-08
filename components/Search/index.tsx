"use client";

import { useRef, useState, useEffect, ChangeEvent, useMemo } from "react";

import SettingsWindow from "@/components/Settings/Window";
import { useSettings } from "@/components/Settings/Context";

import SearchInput from "@/components/Search/Input";
import { ResultsList, ResultItem } from "@/components/Search/Results";

import useRetrieveData from "@/hooks/useRetrieveData";
import useDataHandling from "@/hooks/useDataHandling";

import { debounce } from "@/utils";

import { FiSettings } from "react-icons/fi";

import Fuse from "fuse.js";

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
  const [searchKey, setSearchKey] = useState<string>(config.searchKey || "id");

  useEffect(() => {
    // Sync searchKey with config
    setSearchKey(config.searchKey || "id");
  }, [config.searchKey])

  useEffect(() => {
    fuse.current = new Fuse(names, {
      keys: [searchKey],
      threshold: 0.2,
      includeMatches: true,
    });
  }, [names, searchKey]);

  useEffect(() => {
    loadNames();
  }, []);


  const displayedItems = 200;
  const [displayedItemsCount, setDisplayedItemsCount] = useState<number>(displayedItems);

  const { loadItems, error } = useRetrieveData(itemsFile);
  const { uniqueKeys, loadNames } = useDataHandling(loadItems, config, setConfig, setNames);

  const loadMoreItems = () => {
    setDisplayedItemsCount(displayedItemsCount + 100);
  };

  const [query, setQuery] = useState("");

  const handleInputChange = debounce((event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);
  }, 200);

  // const renderedResults = [];
  const renderresults = useMemo(() => {
    if (query && query.length >= 2) {
      const results = fuse.current?.search(query) ?? [];
      return results
        .slice(0, displayedItemsCount)
        .map((result) => (
          <ResultItem
            key={result.item.id}
            item={result.item}
            result={result}
            config={config}
            query={query}
            searchKey={searchKey}
          />
        ));
    } else {
      return names
        .slice(0, displayedItemsCount)
        .map((name) => (
          <ResultItem key={name.id} item={name} config={config} query={query} searchKey={searchKey} />
        ));
    }
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
          searchKey={searchKey}
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
        <ResultItem key={name.id} item={name} config={config} query={query} searchKey={searchKey} />
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

  const handleSearchKeyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newSearchKey = event.target.value;
    setSearchKey(newSearchKey);
    const newConfig = { ...config, searchKey: newSearchKey };
    setConfig(newConfig); // This updates both context and local storage
  };

  const [isActive, setIsActive] = useState(false);

  const searchBarRef = useRef<HTMLDivElement | null>(null);

  return (
    <main className={`px-4`}>
      <div id="search">
        <div className="mb-6 pt-8">
          Fetching from <span className="inline rounded-md p-2">{itemsFile}</span>
        </div>
        {error && <div className="error-message">Error: {error.message}</div>}
        <div className="flex h-[120px] justify-stretch gap-2" id="search-bar" ref={searchBarRef}>
          <select
            value={searchKey}
            onChange={handleSearchKeyChange}
            onClick={() => setIsActive(!isActive)}
            className="my-8 min-w-[100px] max-w-[200px] rounded-md border border-neutral-300 bg-neutral-100 px-4 dark:border-neutral-600 dark:bg-neutral-950"
          >
            {Array.from(uniqueKeys)
              .filter((key) => config.keys[key])
              .map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
          </select>
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
    </main>
  );
};

export default Search;
