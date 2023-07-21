import React from "react";

interface Item {
  [key: string]: string;
}

interface ResultItemProps {
  item: Item;
  config: any;
  result?: Record<string, any>;
  query: any;
  searchKey: string;
}

export const ResultItem: React.FC<ResultItemProps> = ({ item, config, result, query, searchKey }) => {
  const highlightMatches = ({ item, matches }: any) => {
    let highlightedText = "";
    let lastIndex = 0;

    matches.forEach(({ indices, key }: any) => {
      if (key !== searchKey) {
        return;
      }

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

  return (
    <div id="result" className="relative p-4 border border-gray-300 dark:border-gray-700 rounded shadow-sm">
      {config.thumbnailKey &&
        item[config.thumbnailKey] && ( // Check if item has a value for thumbnailKey
          <div className="mb-3">
            <span
              className="icon text-2xl"
              dangerouslySetInnerHTML={{
                __html: `${item[config.thumbnailKey]}`,
                // __html: `&#x${item[config.thumbnailKey]};`,
              }}
            ></span>
          </div>
        )}

      {Object.entries(item).map(([key, value]) => {
        if (!config.keys[key]) return null;

        return (
          <div key={`${item.id}-${key}`}>
            {key === searchKey ? (
              <div>
                {config.showKey && <span>{key}: </span>}
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
              <div>
                {config.showKey && <span>{key}: </span>}
                <span>{value as string}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
