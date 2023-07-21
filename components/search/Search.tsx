"use client";

import React, { useRef, useState, useEffect, ChangeEvent, useLayoutEffect } from "react";

import { FiSettings, FiChevronDown } from "react-icons/fi";

import SettingsPane from "@/components/settings";
import { useSettings } from "@/components/settings";

import { SearchBar } from "@/components/search/SearchBar";
import { Results } from "@/components/search/Results";
import { LoadMore } from "@/components/search/LoadMore";
import { ResultItem } from "@/components/search/ResultItem";

import useRetrieveData from "@/hooks/useRetrieveData";
import useDataHandling from "@/hooks/useDataHandling";

import Fuse from "fuse.js";

import { debounce } from "@/utils";

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

  useLayoutEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(config.theme);
  }, [config.theme]);

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

  const renderedResults = [];

  let loadMoreElement = null;

  if (query && query.length >= 2) {
    const results = fuse.current?.search(query) ?? [];
    for (let i = 0; i < Math.min(displayedItemsCount, results.length); i++) {
      const result = results[i];
      const item = result.item;
      renderedResults.push(
        <ResultItem key={result.item.id} item={item} result={result} config={config} query={query} searchKey={searchKey} />
      );
    }
    loadMoreElement = (
      <LoadMore count={results.length} loadMoreItems={loadMoreItems} displayedItemsCount={displayedItemsCount} />
    );
  } else {
    const namesToRender = names.slice(0, displayedItemsCount);
    for (let i = 0; i < namesToRender.length; i++) {
      const name = namesToRender[i];
      renderedResults.push(<ResultItem key={name.id} item={name} config={config} query={query} searchKey={searchKey} />);
    }
    loadMoreElement = (
      <LoadMore count={names.length} loadMoreItems={loadMoreItems} displayedItemsCount={displayedItemsCount} />
    );
  }

  const [showSettings, setShowSettings] = useState(false);

  const handleSearchKeyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSearchKey(event.target.value);
  };

  const [isActive, setIsActive] = useState(false);

  return (
    <main className={`px-4`}>
      <div id="search">
        <div className="mb-6 pt-8">
          Fetching from <pre className="inline p-2 rounded-md">{itemsFile}</pre>
        </div>
        {error && <div className="error-message">Error: {error.message}</div>}
        <div className="flex gap-6 items-start justify-start mb-6" id="search-bar">
          <select
            onChange={handleSearchKeyChange}
            onClick={() => setIsActive(!isActive)}
            className=" border dark:border-gray-700 border-gray-300 px-4 pr-8 h-12 -outline-offset-1"
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
        <Results results={renderedResults} />
        <div>{loadMoreElement}</div>
        <FiSettings className="settings-icon fixed bottom-10 left-10" onClick={() => setShowSettings(!showSettings)} />
        {showSettings && <SettingsPane onClose={() => setShowSettings(false)} />}
      </div>
    </main>
  );
};

export default Search;
