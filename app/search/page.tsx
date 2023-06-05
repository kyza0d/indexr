"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import Fuse from "fuse.js";

interface Item {
  Name: string;
}

const loadItems = async (): Promise<Item[]> => {
  const response = await fetch("/items.json");
  return response.json();
};

const Search = () => {
  const searchInput = useRef<HTMLInputElement>(null);
  const [names, setNames] = useState<string[]>([]);
  const [displayedItemsCount, setDisplayedItemsCount] = useState<number>(100);
  const [query, setQuery] = useState<string>("");

  const highlightMatches = ({ item, matches }: any) => {
    let highlightedText = "";
    let lastIndex = 0;
    matches.forEach(({ indices }: any) => {
      indices.forEach(([start, end]: number[]) => {
        const beforeMatch = item.slice(lastIndex, start);
        const matchedText = item.slice(start, end + 1);
        if (matchedText === searchInput.current?.value) {
          highlightedText += `${beforeMatch}<mark>${matchedText}</mark>`;
          lastIndex = end + 1;
        }
      });
      highlightedText += item.slice(lastIndex);
    });
    return highlightedText;
  };

  const loadMoreItems = () => {
    setDisplayedItemsCount(displayedItemsCount + 100);
  };

  const renderNames = () => {
    const fuse = new Fuse(names, {
      keys: ["Name"],
      threshold: 0.2,
      includeMatches: true,
    });
    const results = fuse.search(query);
    const renderedResults = [];

    if (query && query.length >= 2) {
      for (let i = 0; i < Math.min(displayedItemsCount, results.length); i++) {
        renderedResults.push(renderName(highlightMatches(results[i]), i));
      }

      if (results.length > displayedItemsCount) {
        renderedResults.push(
          <p key="more">{`${results.length - displayedItemsCount
            } more items...`}</p>,
          <button onClick={loadMoreItems} key="load-more">
            Load more
          </button>
        );
      }
    } else {
      for (let i = 0; i < Math.min(displayedItemsCount, names.length); i++) {
        renderedResults.push(renderName(names[i], i));
      }

      if (names.length > displayedItemsCount) {
        renderedResults.push(
          <p key="more">{`${names.length - displayedItemsCount
            } more items...`}</p>,
          <button onClick={loadMoreItems} key="load-more">
            Load more
          </button>
        );
      }
    }

    return renderedResults;
  };

  useEffect(() => {
    const loadNames = async () => {
      const items = await loadItems();
      const extractedNames = items.map(({ Name }: Item) => Name);
      setNames(extractedNames);
    };
    loadNames();
  }, []);

  const debounce = <T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  const handleInputChange = debounce((event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);
  }, 200);

  const renderName = (name: string, index: number) => (
    <p key={index} dangerouslySetInnerHTML={{ __html: name }} />
  );

  return (
    <div>
      <input
        ref={searchInput}
        id="search"
        type="text"
        onChange={handleInputChange}
      />
      <div id="names">{renderNames()}</div>
    </div>
  );
};

export default Search;
