"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/components/settings/context";
import { Card } from "../ui/card";

interface ResultsProps {
  results: JSX.Element[];
}

interface Item {
  [key: string]: string;
}

interface ResultItemProps {
  item: Item;
  config: {
    keys: Record<string, any>;
    thumbnailKey: string;
    showKey: boolean;
  };
  result?: Record<string, any>;
  query: any;
  searchKey: string;
}

export const ResultItem: React.FC<ResultItemProps> = ({ item, config, result, query, searchKey }) => {
  // Function to highlight the matches
  const highlightMatches = ({ item, matches }: any) => {
    let highlightedText = "";
    let lastIndex = 0;

    matches.forEach(({ indices, key }: any) => {
      if (key !== searchKey) return;

      indices.forEach(([start, end]: number[]) => {
        const beforeMatch = item[searchKey].slice(lastIndex, start);
        const matchedText = item[searchKey].slice(start, end + 1);

        if (matchedText.toLowerCase() === query.toLowerCase()) {
          highlightedText += `${beforeMatch}<mark>${matchedText}</mark>`;
          lastIndex = end + 1;
        }
      });

      highlightedText += item[searchKey].slice(lastIndex);
    });

    return highlightedText;
  };

  const thumbnail = item[config.thumbnailKey];

  return (
    <Card
      id="result"
      className="relative p-3"
    >
      {config.thumbnailKey && item[config.thumbnailKey] && (
        <div className="mb-3">
          <span className="icon text-2xl">{thumbnail}</span>
        </div>
      )}

      {Object.entries(item).map(([key, value]) => {
        if (config.keys && !config.keys[key]) return null;

        const isSearchKey = key === searchKey;

        return (
          <div key={`${item.id}-${key}`}>
            {config.showKey && <span>{key}: </span>}
            {isSearchKey && result ? (
              <span dangerouslySetInnerHTML={{ __html: highlightMatches(result) }} />
            ) : (
              <span>{value}</span>
            )}
          </div>
        );
      })}
    </Card>
  );
};

type LayoutMode = "Grid View" | "List View" | "Detail View" | "Card View" | "Compact View" | "Tile View";

const layoutClassMap: Record<LayoutMode, string> = {
  "Grid View": "grid grid-cols-4 gap-4",
  "List View": "flex flex-col",
  "Detail View": "grid grid-cols-1 gap-4",
  "Card View": "grid grid-cols-2 gap-4",
  "Compact View": "flex flex-row flex-wrap",
  "Tile View": "grid grid-cols-10 gap-4 text-sm",
};

export const ResultsList: React.FC<ResultsProps> = ({ results }) => {
  const { config } = useSettings();
  const fallbackClass = layoutClassMap["Grid View"];
  const [layoutClass, setLayoutClass] = useState(fallbackClass);

  useEffect(() => {
    setLayoutClass(layoutClassMap[config.layout as LayoutMode] || fallbackClass);
  }, [config.layout]);

  return (
    <div className={layoutClass}>
      {results.map((result, index) => (
        <div key={index} className="whitespace-pre-wrap break-all">
          {result}
        </div>
      ))}
    </div>
  );
};
