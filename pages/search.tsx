import React, { useState, useEffect } from "react";
import Fuse from "fuse.js";

interface Item {
  Name: string;
}

const loadItems = async (): Promise<Item[]> => {
  const response = await fetch("/items.json");
  return response.json();
};

const highlightMatches = ({ item, matches }: any) => {
  let highlightedText = "";
  let lastIndex = 0;
  matches.forEach(({ indices }: any) => {
    indices.forEach(([start, end]: number[]) => {
      const beforeMatch = item.slice(lastIndex, start);
      const matchedText = item.slice(start, end + 1);
      highlightedText += `${beforeMatch}<mark>${matchedText}</mark>`;
      lastIndex = end + 1;
    });
  });
  highlightedText += item.slice(lastIndex);
  return highlightedText;
};

const Search = () => {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    const loadNames = async () => {
      const items = await loadItems();
      const extractedNames = items.map(({ Name }: Item) => Name);
      setNames(extractedNames);
    };
    loadNames();
  }, []);

  const [query, setQuery] = useState<string>("");

  const renderName = (name: string) => {
    return <p dangerouslySetInnerHTML={{ __html: name }} />;
  };

  const debounce = (fn: any, delay: number) => {
    let timeoutId: any;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  const handleInputChange = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;
      setQuery(query);
    },
    200
  );

  const searchResults = () => {
    if (!query || query.length < 2) {
      return names.map(renderName);
    }
    const fuse = new Fuse(names, {
      keys: ["Name"],
      threshold: 0.2,
      includeMatches: true,
    });
    const results = fuse.search(query);
    return results.map((result) => renderName(highlightMatches(result)));
  };

  return (
    <div>
      <input id="search" type="text" onChange={handleInputChange} />
      <div id="names">{searchResults()}</div>
    </div>
  );
};

export default Search;
