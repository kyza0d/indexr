import React from 'react';

interface ResultsProps {
  results: any[]; // Array of search results
  query: string; // The search query string
  searchKey: string | null; // The specific key being searched, if any
}

/**
 * Results component displays the search results.
 * It takes in the search results, the original query, and the specific key being searched (if any),
 * and renders a formatted list of the results with highlighted matches.
 */
const Results: React.FC<ResultsProps> = ({ results, query, searchKey }) => {
  /**
   * Highlights the matched portions of text.
   * This function takes the original text and an array of index pairs indicating where matches occur,
   * then wraps the matched portions in <mark> tags for highlighting in the UI.
   */
  const highlightMatches = (text: string, indices: number[][]) => {
    if (!indices || indices.length === 0) return text;

    let highlightedText = '';
    let lastIndex = 0;

    indices.forEach(([start, end]) => {
      highlightedText += text.slice(lastIndex, start);
      highlightedText += `<mark>${text.slice(start, end + 1)}</mark>`;
      lastIndex = end + 1;
    });

    highlightedText += text.slice(lastIndex);
    return highlightedText;
  };

  /**
   * Recursively renders the value of a search result item.
   * This function handles different data types (objects, arrays, primitives) and applies
   * appropriate formatting and indentation. It also manages the highlighting of matched terms.
   * 
   * @param path - The current path in the object structure, used for labeling and match finding
   * @param value - The value to render, which can be of any type
   * @param matches - Array of match objects from Fuse.js
   * @param level - The current nesting level, used for indentation
   */
  const renderValue = (path: string, value: any, matches: any[], level = 0) => {
    // Handle object types (including arrays)
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        // Render arrays as comma-separated values
        return (
          <div style={{ marginLeft: `${level * 20}px` }}>
            {path && <span className="font-semibold">{path}: </span>}
            {value.join(', ')}
          </div>
        );
      } else {
        // Render objects by recursively calling renderValue for each property
        return (
          <div style={{ marginLeft: `${level * 20}px` }}>
            {path && <span className="font-semibold">{path}:</span>}
            {Object.entries(value).map(([key, subValue]) => (
              <div key={key}>
                {renderValue(`${path}${path ? '.' : ''}${key}`, subValue, matches, level + 1)}
              </div>
            ))}
          </div>
        );
      }
    }

    // Handle primitive values (strings, numbers, booleans)
    const stringValue = String(value);
    // Find if there's a match for this specific path
    const match = matches.find(m => m.key === path);
    // If there's a match, highlight it; otherwise, render the value as-is
    const highlightedValue = match
      ? <span dangerouslySetInnerHTML={{ __html: highlightMatches(stringValue, match.indices) }} />
      : stringValue;

    return (
      <div style={{ marginLeft: `${level * 20}px` }}>
        {path && <span className="font-semibold">{path.split('.').pop()}: </span>}
        {highlightedValue}
      </div>
    );
  };

  // If no results are found, display a message
  if (results.length === 0) {
    return <p className="mt-4 text-gray-500">No results found.</p>;
  }

  // Render the list of search results
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Search Results</h2>
      <ul className="space-y-4">
        {results.map((result, index) => {
          const item = result.item;
          const matches = result.matches || [];
          return (
            <li key={index} className="bg-white p-4 rounded-md shadow">
              {/* Render each result item, starting with no initial path */}
              {renderValue('', item, matches, 0)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Results;
