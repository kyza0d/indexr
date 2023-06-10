"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import Fuse from "fuse.js";
import { debounce } from "@/utils";

// Interface for the item object
interface Item {
  [key: string]: string;
}

// Configuration options
const config = {
  thumbnailKey: "code", // Key for the thumbnail property
  showKey: true, // Whether to show the key in the rendered results
};

// File path for the items data
const items_file = "/glyphnames.json";

// Function to load the items data from the file
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
    // console.error("Failed to load items:", error);
    return [];
  }
};

const maxDisplayedItems = 200;

const Search = () => {
  const [names, setNames] = useState<Item[]>([]);
  const [displayedItemsCount, setDisplayedItemsCount] =
    useState<number>(maxDisplayedItems);
  const [query, setQuery] = useState<string>("");

  const fuse = useRef<Fuse<Item> | null>(null);

  useEffect(() => {
    // Initialize the Fuse instance when the names data changes
    fuse.current = new Fuse(names, {
      keys: ["id"],
      threshold: 0.2,
      includeMatches: true,
    });
  }, [names]);

  useEffect(() => {
    // Load the names data on component mount
    loadNames();
  }, []);

  // Render the list of names based on the current search query and displayed items count
  const renderNames = () => {
    const results = fuse.current?.search(query) ?? [];
    const renderedResults = [];

    if (query && query.length >= 2) {
      // Render search results with query highlighting
      for (let i = 0; i < Math.min(displayedItemsCount, results.length); i++) {
        const result = results[i];
        const item = result.item;
        renderedResults.push(<div key={item.id}>{renderResultItem(item, result)}</div>);
      }

      renderedResults.push(renderLoadMore(results.length));
    } else {
      // Render initial names with load more option
      const namesToRender = names.slice(0, displayedItemsCount);

      for (let i = 0; i < namesToRender.length; i++) {
        const name = namesToRender[i];
        renderedResults.push(<div key={name.id}>{renderResultItem(name)}</div>);
      }

      renderedResults.push(renderLoadMore(names.length));
    }

    return renderedResults;
  };

  // Render an individual result item
  const renderResultItem = (item: Item, result?: Record<string, any>) => {
    return (
      <div id="result" className="relative  border border-gray-400">
        {config.thumbnailKey && (
          <div className="px-3">
            <span
              className="icon"
              dangerouslySetInnerHTML={{ __html: `&#x${item[config.thumbnailKey]};` }}
            ></span>
          </div>
        )}

        {Object.entries(item).map(([key, value]) => (
          <div key={`${item.id}-${key}`}>
            {key === "id" ? (
              // Render the title with optional key and query highlighting
              <div
                className="-top-8 absolute p-2 px-3 w-full outline outline-1 outline-gray-400"
                id="title"
              >
                {config.showKey && <strong>{key}: </strong>}
                {result ? (
                  <span dangerouslySetInnerHTML={{ __html: highlightMatches(result) }} />
                ) : (
                  <span>{value as string}</span>
                )}
              </div>
            ) : (
              // Render other key-value pairs
              <div className="px-3">
                {config.showKey && <strong>{key}: </strong>}
                <span>{value as string}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Highlight the matched portions of the item's name
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

  // Render the load more button if there are more items to load
  const renderLoadMore = (count: number) => {
    if (count > displayedItemsCount) {
      return (
        <nav id="load-more" key="load-more">
          <p key="more">{`${count - displayedItemsCount} more items...`}</p>
          <button
            onClick={loadMoreItems}
            key="load-more-button"
            className="px-6 py-2 border border-gray-400 rounded-md"
          >
            Load more
          </button>
        </nav>
      );
    }
    return null;
  };

  // Load more items when the load more button is clicked
  const loadMoreItems = () => {
    setDisplayedItemsCount(displayedItemsCount + 100);
  };

  // Load the names data from the file
  const loadNames = async () => {
    const items = await loadItems();
    setNames(items);
  };

  // Handle input change with debounce to delay search query updates
  const handleInputChange = debounce((event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);
  }, maxDisplayedItems);

  const searchInput = useRef<HTMLInputElement>(null);

  return (
    <main>
      <div id="search">
        <nav id="controls">
          <div className="mb-6">
            Fetching from <pre className="inline p-2 rounded-md">{items_file}</pre>
          </div>
          <input ref={searchInput} type="text" onChange={handleInputChange} />
        </nav>
        <div id="names">{renderNames()}</div>
      </div>
    </main>
  );
};

export default Search;
