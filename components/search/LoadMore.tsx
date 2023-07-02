// LoadMore.tsx

import React from "react";

interface LoadMoreProps {
  count: number;
  loadMoreItems: () => void;
  displayedItemsCount: number;
}

export const LoadMore: React.FC<LoadMoreProps> = ({ count, loadMoreItems, displayedItemsCount }) => {
  if (count > displayedItemsCount) {
    return (
      <nav id="load-more" key="load-more" className="w-full flex my-6">
        <p key="more">{`${count - displayedItemsCount} more items...`}</p>
        <button
          onClick={loadMoreItems}
          key="load-more-button"
          className="px-6 mx-auto py-2 border border-gray-400 rounded-md"
        >
          Load more
        </button>
      </nav>
    );
  }
  return null;
};
