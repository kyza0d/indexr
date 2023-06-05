"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import Fuse from "fuse.js";

interface Item {
  Name: string;
}

// 1. Define an asynchronous function that loads items from a JSON file.
const loadItems = async (): Promise<Item[]> => {
  const response = await fetch("/items.json");
  return response.json();
};

// 2. Define the Search component.
const Search = () => {
  // 3. Create a reference to the search input element.
  const searchInput = useRef<HTMLInputElement>(null);

  // 4. Initialize state variables.
  const [names, setNames] = useState<string[]>([]);
  const [displayedItemsCount, setDisplayedItemsCount] = useState<number>(100);
  const [query, setQuery] = useState<string>("");

  // 5. Define a function to highlight matches in the item names.
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

  // 6. Define a function to load more items when the "Load more" button is clicked.
  const loadMoreItems = () => {
    setDisplayedItemsCount(displayedItemsCount + 100);
  };

  // 7. Define a function to render the names based on the current query and displayed item count.
  const renderNames = () => {
    // 8. Initialize a new Fuse instance with the names and search options.
    const fuse = new Fuse(names, {
      keys: ["Name"],
      threshold: 0.2,
      includeMatches: true,
    });
    const results = fuse.search(query);
    const renderedResults = [];

    if (query && query.length >= 2) {
      // 9. Render the highlighted names for the matching results.
      for (let i = 0; i < Math.min(displayedItemsCount, results.length); i++) {
        renderedResults.push(renderName(highlightMatches(results[i]), i));
      }

      if (results.length > displayedItemsCount) {
        // 10. Show the "Load more" button if there are more items to load.
        renderedResults.push(
          <p key="more">{`${results.length - displayedItemsCount
            } more items...`}</p>,
          <button onClick={loadMoreItems} key="load-more">
            Load more
          </button>
        );
      }
    } else {
      // 11. Render the names without highlighting if there is no query or the query is too short.
      for (let i = 0; i < Math.min(displayedItemsCount, names.length); i++) {
        renderedResults.push(renderName(names[i], i));
      }

      if (names.length > displayedItemsCount) {
        // 12. Show the "Load more" button if there are more items to load.
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

  // 13. Load the items when the component mounts.
  useEffect(() => {
    const loadNames = async () => {
      const items = await loadItems();
      const extractedNames = items.map(({ Name }: Item) => Name);
      setNames(extractedNames);
    };
    loadNames();
  }, []);

  // 14. Define a debounce function to delay the input change event handler.
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

  // 15. Define the input change event handler with debounce.
  const handleInputChange = debounce((event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);
  }, 200);

  // 16. Define a function to render a name with HTML formatting.
  const renderName = (name: string, index: number) => (
    <p key={index} dangerouslySetInnerHTML={{ __html: name }} />
  );

  // 17. Render the Search component.
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
