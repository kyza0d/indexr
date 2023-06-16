"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import Fuse from "fuse.js";
import { debounce } from "@/utils";
import { FiSettings } from "react-icons/fi";
import { useSettings } from "@/components/settings";
import SettingsPane from "@/components/settings";

interface Item {
  [key: string]: string;
}

const itemsFile = "/glyphnames.json";

const Search = () => {
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

  const renderResultItem = (item: Item, result?: Record<string, any>) => {
    return (
      <div id="result" className="relative border border-gray-400">
        {config.thumbnailKey && (
          <div className="px-3">
            <span
              className="icon"
              dangerouslySetInnerHTML={{
                __html: `&#x${item[config.thumbnailKey]};`,
              }}
            ></span>
          </div>
        )}

        {Object.entries(item).map(([key, value]) => {
          if (!config.keys[key]) return null; // Use keys here, not updatedKeys

          return (
            <div key={`${item.id}-${key}`}>
              {key === "id" ? (
                <div className="px-3">
                  {config.showKey && <strong>{key}: </strong>}
                  {result ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlightMatches(result),
                      }}
                    />
                  ) : (
                    <span>{value as string}</span>
                  )}
                </div>
              ) : (
                <div className="px-3">
                  {config.showKey && <strong>{key}: </strong>}
                  <span>{value as string}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const [query, setQuery] = useState<string>("");

  const highlightMatches = ({ item, matches }: any) => {
    let highlightedText = "";
    let lastIndex = 0;

    matches.forEach(({ indices }: any) => {
      indices.forEach(([start, end]: number[]) => {
        const beforeMatch = item.id.slice(lastIndex, start);
        const matchedText = item.id.slice(start, end + 1);
        if (matchedText.toLowerCase() === query.toLowerCase()) {
          highlightedText += `${beforeMatch}<mark>${matchedText}</mark>`;
          lastIndex = end + 1;
        }
      });

      highlightedText += item.id.slice(lastIndex);
    });
    return highlightedText;
  };

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

  const handleInputChange = debounce((event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);
  }, 200);

  const renderNames = () => {
    const results = fuse.current?.search(query) ?? [];
    const renderedResults = [];

    if (query && query.length >= 2) {
      for (let i = 0; i < Math.min(displayedItemsCount, results.length); i++) {
        const result = results[i];
        const item = result.item;
        renderedResults.push(<div key={result.item.id}>{renderResultItem(item, result)}</div>);
      }

      renderedResults.push(renderLoadMore(results.length));
    } else {
      const namesToRender = names.slice(0, displayedItemsCount);

      for (let i = 0; i < namesToRender.length; i++) {
        const name = namesToRender[i];
        renderedResults.push(<div key={name.id}>{renderResultItem(name)}</div>);
      }

      renderedResults.push(renderLoadMore(names.length));
    }

    return renderedResults;
  };

  const loadMoreItems = () => {
    setDisplayedItemsCount(displayedItemsCount + 100);
  };

  const searchInput = useRef<HTMLInputElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <main>
      <div id="search">
        <nav id="controls">
          <div className="mb-6">
            Fetching from <pre className="inline p-2 rounded-md">{itemsFile}</pre>
          </div>
          <input ref={searchInput} type="text" onChange={handleInputChange} />
        </nav>
        <div id="names">{renderNames()}</div>
        <FiSettings className="settings-icon fixed bottom-10 left-10" onClick={() => setShowSettings(!showSettings)} />
        {showSettings && <SettingsPane onClose={() => setShowSettings(false)} />}
      </div>
    </main>
  );
};

export default Search;
