import Image from "next/image";

interface Item {
  [key: string]: string;
}

interface ResultItemProps {
  item: Item;
  config: {
    keys: Record<string, any>;
    thumbnailKey: string;
    thumbnailType: string;
    showKey: boolean;
  };
  result?: Record<string, any>;
  query: any;
  searchKey: string;
}

export const ResultItem: React.FC<ResultItemProps> = ({
  item,
  config,
  result,
  query,
  searchKey,
}) => {
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

  // Function to determine the thumbnail type
  const getThumbnailType = () => {
    if (config.thumbnailType === "image") {
      try {
        new URL(item[config.thumbnailKey]);
        return item[config.thumbnailKey];
      } catch (_) {
        console.warn("Invalid URL found for thumbnail");
        return null;
      }
    }

    return item[config.thumbnailKey];
  };

  const thumbnail = getThumbnailType();

  return (
    <div
      id="result"
      className="relative p-3 border border-gray-300 dark:border-[#545454] shadow-sm"
    >
      {config.thumbnailKey && item[config.thumbnailKey] && (
        <div className="mb-3">
          {thumbnail && config.thumbnailType === "image" ? (
            <img src={thumbnail} alt="Thumbnail" className="w-20" />
          ) : (
            <span className="icon text-2xl">{thumbnail}</span>
          )}
        </div>
      )}

      {Object.entries(item).map(([key, value]) => {
        if (!config.keys[key]) return null;

        const isSearchKey = key === searchKey;

        return (
          <div key={`${item.id}-${key}`}>
            {config.showKey && <span>{key}: </span>}
            {isSearchKey && result ? (
              <span
                dangerouslySetInnerHTML={{ __html: highlightMatches(result) }}
              />
            ) : (
              <span>{value}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
