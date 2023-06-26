"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import Fuse from "fuse.js";
import { FiSettings } from "react-icons/fi";
import { useSettings } from "@/components/settings";
import SettingsPane from "@/components/settings";

import { SearchBar } from "@/components/search/SearchBar";
import { Results } from "@/components/search/Results";
import { LoadMore } from "@/components/search/LoadMore";
import { ResultItem } from "@/components/search/ResultItem";

import { debounce } from "@/utils";

interface Item {
  [key: string]: string;
}

const Search = ({ itemsFile }: { itemsFile: string }) => {
  const fuse = useRef<Fuse<Item> | null>(null);
  const [names, setNames] = useState<Item[]>([]);

  useEffect(() => {
    fuse.current = new Fuse(names, {
      keys: ["id"],
      threshold: 0.2,
      includeMatches: true,
    });
  }, [names]);

  useEffect(() => {
    loadNames();
  }, []);

  const { config, setConfig } = useSettings();

  const displayedItems = 200;
  const [displayedItemsCount, setDisplayedItemsCount] = useState<number>(displayedItems);

  const renderLoadMore = (count: number) => {
    if (count > displayedItemsCount) {
      return (
        <nav id="load-more" key="load-more">
          <p key="more">{`${count - displayedItemsCount} more items...`}</p>
          <button onClick={loadMoreItems} key="load-more-button" className="px-6 py-2 border border-gray-400 rounded-md">
            Load more
          </button>
        </nav>
      );
    }
    return null;
  };

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

  const loadNames = async () => {
    const items = await loadItems();
    setNames(items);

    const keys: { [key: string]: boolean } = {};

    items.forEach((item) => {
      Object.keys(item).forEach((key) => {
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
      renderedResults.push(<ResultItem key={result.item.id} item={item} result={result} config={config} query={query} />);
    }
    renderedResults.push(
      <LoadMore count={results.length} loadMoreItems={loadMoreItems} displayedItemsCount={displayedItemsCount} />
    );
  } else {
    const namesToRender = names.slice(0, displayedItemsCount);

    for (let i = 0; i < namesToRender.length; i++) {
      const name = namesToRender[i];
      renderedResults.push(<ResultItem key={name.id} item={name} config={config} query={query} />);
    }
    renderedResults.push(
      <LoadMore count={names.length} loadMoreItems={loadMoreItems} displayedItemsCount={displayedItemsCount} />
    );
  }

  const searchInput = useRef<HTMLInputElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <main>
      <div id="search">
        <SearchBar handleInputChange={handleInputChange} itemsFile={itemsFile} />
        <Results results={renderedResults} />
        <FiSettings className="settings-icon fixed bottom-10 left-10" onClick={() => setShowSettings(!showSettings)} />
        {showSettings && <SettingsPane onClose={() => setShowSettings(false)} />}
      </div>
    </main>
  );
};

export default Search;
