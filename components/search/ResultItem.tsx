// ResultItem.tsx

import React, { useState } from "react";

interface Item {
  [key: string]: string;
}

interface ResultItemProps {
  item: Item;
  config: any;
  result?: Record<string, any>;
  query: any;
}

export const ResultItem: React.FC<ResultItemProps> = ({ item, config, result, query }) => {
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
