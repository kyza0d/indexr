"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";

import { FiSettings } from "react-icons/fi";

import SettingsPane from "@/components/settings";
import { useSettings } from "@/components/settings";

import { SearchBar } from "@/components/search/SearchBar";
import { Results } from "@/components/search/Results";
import { LoadMore } from "@/components/search/LoadMore";
import { ResultItem } from "@/components/search/ResultItem";

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

  const displayedItems = 200;
  const [displayedItemsCount, setDisplayedItemsCount] = useState<number>(displayedItems);

  const loadItems = async (): Promise<Item[]> => {
    try {
      const response = await fetch(itemsFile);
      const jsonData: unknown = await response.json();

      if (Array.isArray(jsonData)) {
        if (jsonData[0]._id) {
          const items: Item[] = jsonData.map((item: any) => {
            const keys = Object.keys(item);
            const newItem: Item = { id: item._id };
            keys.forEach((key) => {
              newItem[key] = typeof item[key] === "object" ? JSON.stringify(item[key]) : item[key];
            });
            return newItem;
          });
          return items;
        } else {
          return jsonData as Item[];
        }
      } else if (typeof jsonData === "object") {
        const items: Item[] = [];
        for (const [key, value] of Object.entries(jsonData as object)) {
          const newItem: Item = { id: key };
          const keys = Object.keys(value);
          keys.forEach((k) => {
            newItem[k] = typeof value[k] === "object" ? JSON.stringify(value[k]) : value[k];
          });
          items.push(newItem);
        }
        return items;
      } else {
        throw new Error("Invalid JSON format");
      }
    } catch (error) {
      console.error("Failed to load items:", error);
      return [];
    }
  };

  const [uniqueKeys, setUniqueKeys] = useState<Set<string>>(new Set());

  const loadNames = async () => {
    const items = await loadItems();

    setNames(items);

    const keys: { [key: string]: boolean | string } = {};

    items.forEach((item) => {
      Object.keys(item).forEach((key) => {
        uniqueKeys.add(key);
        if (!(key in config.keys)) {
          keys[key] = true;
        } else {
          keys[key] = config.keys[key];
        }
      });
    });

    setConfig((prevConfig: any[]) => ({
      ...prevConfig,
      keys: keys,
    }));
  };

  const loadMoreItems = () => {
    setDisplayedItemsCount(displayedItemsCount + 100);
  };

  const [query, setQuery] = useState("");

  const handleInputChange = debounce((event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);
  }, 200);

  const renderedResults = []; // Use this to store rendered results.

  if (query && query.length >= 2) {
    const results = fuse.current?.search(query) ?? [];
    for (let i = 0; i < Math.min(displayedItemsCount, results.length); i++) {
      const result = results[i];
      const item = result.item;
      renderedResults.push(
        <ResultItem key={result.item.id} item={item} result={result} config={config} query={query} searchKey={searchKey} />
      );
    }
    renderedResults.push(
      <LoadMore count={results.length} loadMoreItems={loadMoreItems} displayedItemsCount={displayedItemsCount} />
    );
  } else {
    const namesToRender = names.slice(0, displayedItemsCount);

    for (let i = 0; i < namesToRender.length; i++) {
      const name = namesToRender[i];
      renderedResults.push(<ResultItem key={name.id} item={name} config={config} query={query} searchKey={searchKey} />);
    }
    renderedResults.push(
      <LoadMore count={names.length} loadMoreItems={loadMoreItems} displayedItemsCount={displayedItemsCount} />
    );
  }

  const searchInput = useRef<HTMLInputElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleSearchKeyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSearchKey(event.target.value);
  };

  return (
    <main>
      <div id="search">
        <div className="mb-6">
          Fetching from <pre className="inline p-2 rounded-md">{itemsFile}</pre>
        </div>
        <div className="flex gap-6 items-start justify-start">
          <select onChange={handleSearchKeyChange} className="outline outline-1 outline-[#B2B2B2] bg-[#ffffff] px-6 h-12">
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
        <FiSettings className="settings-icon fixed bottom-10 left-10" onClick={() => setShowSettings(!showSettings)} />
        {showSettings && <SettingsPane onClose={() => setShowSettings(false)} />}
      </div>
    </main>
  );
};

export default Search;
