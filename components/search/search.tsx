"use client";

import { useRef, useState, useEffect, ChangeEvent, useMemo } from "react";

import SettingsWindow from "@/components/settings/settingsWindow";
import { useSettings } from "@/components/settings/context";

import { SearchBar } from "@/components/search/searchBar";
import { Results } from "@/components/search/results";
import { LoadMore } from "@/components/search/loadMore";
import { ResultItem } from "@/components/search/resultItem";

import useRetrieveData from "@/hooks/useRetrieveData";
import useDataHandling from "@/hooks/useDataHandling";

import { debounce } from "@/utils";

import { FiSettings } from "react-icons/fi";

import Fuse from "fuse.js";

interface Item {
  [key: string]: string;
}

const Search = ({ itemsFile }: { itemsFile: string }) => {
  const fuse = useRef<Fuse<Item> | null>(null);

  const [names, setNames] = useState<Item[]>([]);
  const [searchKey, setSearchKey] = useState<string>("id");

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

  const { config, setConfig } = useSettings();

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
    setSearchKey(event.target.value);
  };

  const [isActive, setIsActive] = useState(false);

  const searchBarRef = useRef<HTMLDivElement | null>(null);
  const searchBarInitialPosition = useRef<number | null>(null);

  return (
    <main className={`px-4`}>
      <div id="search">
        <div className="mb-6 pt-8">
          Fetching from <span className="inline p-2 rounded-md">{itemsFile}</span>
        </div>
        {error && <div className="error-message">Error: {error.message}</div>}
        <div className="flex justify-stretch h-[120px]" id="search-bar" ref={searchBarRef}>
          <select
            onChange={handleSearchKeyChange}
            onClick={() => setIsActive(!isActive)}
            className="border border-gray-400 px-4 my-8"
          >
            {Array.from(uniqueKeys)
              .filter((key) => config.keys[key])
              .map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
          </select>
          <SearchBar handleInputChange={handleInputChange} />
        </div>
        <Results results={renderresults} />
        <div>{loadMoreElement}</div>
        <FiSettings
          className="settings-icon fixed top-10 right-10"
          onClick={() => setShowSettings(!showSettings)}
        />
        {showSettings && <SettingsWindow onClose={() => setShowSettings(false)} />}
      </div>
    </main>
  );
};

export default Search;
