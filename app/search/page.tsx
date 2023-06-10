"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import Fuse from "fuse.js";
import { debounce } from "@/utils";

interface Item {
  [key: string]: string;
}

const config = {
  thumbnail: "code",
};

const items_file = "/glyphnames.json";

const loadItems = async (): Promise<Item[]> => {
  try {
    const response = await fetch(items_file);
    const jsonData = await response.json();

    if (Array.isArray(jsonData)) {
      return jsonData;
    } else if (typeof jsonData === "object") {
      const items: Item[] = [];
      for (const [key, value] of Object.entries(jsonData)) {
        const newItem: Item = { id: key, ...(value as Item) };
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

const Search = () => {
  const searchInput = useRef<HTMLInputElement>(null);

  const [names, setNames] = useState<Item[]>([]);
  const [displayedItemsCount, setDisplayedItemsCount] = useState<number>(200);
  const [query, setQuery] = useState<string>("");

  const highlightMatches = ({ item, matches }: any) => {
    let highlightedText = "";
    let lastIndex = 0;

    matches.forEach(({ indices }: any) => {
      indices.forEach(([start, end]: number[]) => {
        const beforeMatch = item.id.slice(lastIndex, start);
        const matchedText = item.id.slice(start, end + 1);
        if (matchedText.toLowerCase() === searchInput.current?.value.toLowerCase()) {
          highlightedText += `${beforeMatch}<mark>${matchedText}</mark>`;
          lastIndex = end + 1;
        }
      });

      highlightedText += item.id.slice(lastIndex);
    });
    return highlightedText;
  };

  const loadMoreItems = () => {
    setDisplayedItemsCount(displayedItemsCount + 100);
  };

  const fuse = useRef<Fuse<Item> | null>(null);

  useEffect(() => {
    fuse.current = new Fuse(names, {
      keys: ["id"],
      threshold: 0.25,
      includeMatches: true,
    });
  }, [names]);

  const renderNames = () => {
    const results = fuse.current?.search(query) ?? [];
    const renderedResults = [];

    const renderResultItem = (item: Item, result?: Record<string, any>) => {
      return (
        <div id="result">
          {config.thumbnail && (
            <div>
              <span
                className="icon"
                dangerouslySetInnerHTML={{ __html: `&#x${item[config.thumbnail]};` }}
              ></span>
            </div>
          )}

          {Object.entries(item).map(([key, value]) => (
            <div key={key}>
              <strong>{key}: </strong>
              {key === "id" && result ? (
                <span dangerouslySetInnerHTML={{ __html: highlightMatches(result) }} />
              ) : (
                <span>{value as string}</span>
              )}
            </div>
          ))}
        </div>
      );
    };

    const renderLoadMore = (count: number) => {
      if (count > displayedItemsCount) {
        return [
          <p key="more">{`${count - displayedItemsCount} more items...`}</p>,
          <button onClick={loadMoreItems} key="load-more">
            Load more
          </button>,
        ];
      }
      return null;
    };

    if (query && query.length >= 2) {
      for (let i = 0; i < Math.min(displayedItemsCount, results.length); i++) {
        const result = results[i];
        const item = result.item;
        renderedResults.push(<div key={i}>{renderResultItem(item, result)}</div>);
      }

      renderedResults.push(renderLoadMore(results.length));
    } else {
      const namesToRender = names.slice(0, displayedItemsCount);

      for (let i = 0; i < namesToRender.length; i++) {
        const name = namesToRender[i];
        renderedResults.push(<div key={i}>{renderResultItem(name)}</div>);
      }

      renderedResults.push(renderLoadMore(names.length));
    }

    return renderedResults;
  };

  useEffect(() => {
    const loadNames = async () => {
      const items = await loadItems();
      setNames(items);
    };
    loadNames();
  }, []);

  const handleInputChange = debounce((event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);
  }, 200);

  return (
    <div id="search" className="p-4">
      <h2 className="mb-12">Indexable.dev</h2>
      <div className="mb-6">
        Fetching from{" "}
        <pre className="inline bg-[#dbdbdb] p-2 rounded-md">{items_file}</pre>
      </div>
      <input ref={searchInput} type="text" onChange={handleInputChange} />
      <div id="names">{renderNames()}</div>
    </div>
  );
};

export default Search;
