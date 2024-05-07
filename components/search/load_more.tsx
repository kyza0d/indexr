import React from 'react';

interface LoadMoreProps {
  count: number; // Total number of items
  loadMoreItems: () => void; // Function to load more items
  displayedItemsCount: number; // Number of items currently displayed
}

const LoadMore: React.FC<LoadMoreProps> = ({ count, loadMoreItems, displayedItemsCount }) => {
  // Check if there are more items to load
  const moreItemsAvailable = count > displayedItemsCount;

  return (
    moreItemsAvailable && (
      <div className="load-more-container">
        <p>{`${count - displayedItemsCount} more items available...`}</p>
        <button
          onClick={loadMoreItems}
          className="load-more-button"
        >
          Load More
        </button>
      </div>
    )
  );
};

export default LoadMore;
