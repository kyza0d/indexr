'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from './_components/FileUpload';
import Search from './_components/Search';
import Results from './_components/Results';
import GitHubUrlInput from './_components/GithubUrlInput';
import { useDataset } from './_hooks/useDataset';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Constants for pagination
const INITIAL_LOAD = 200;
const LOAD_MORE_COUNT = 100;

/**
 * Example datasets for demonstration purposes.
 * These datasets showcase different data structures that the application can handle:
 * - Simple Flat Table: Basic array of objects
 * - Nested Objects Table: Objects with nested properties
 * - Mixed Types Table: Objects with various data types including arrays and nested objects
 * - Named Array Tables: Object of objects, demonstrating key-value pair structure
 */
const data_examples = {
  "Simple Flat Table": [
    { "id": 1, "name": "John Doe", "age": 30, "city": "New York" },
    { "id": 2, "name": "Jane Smith", "age": 25, "city": "Los Angeles" },
    { "id": 3, "name": "Bob Johnson", "age": 35, "city": "Chicago" }
  ],
  "Nested Objects Table": [
    {
      "id": 1,
      "name": "Alice Williams",
      "details": {
        "age": 28,
        "occupation": "Software Engineer",
        "address": {
          "street": "123 Tech Lane",
          "city": "San Francisco",
          "country": "USA"
        }
      },
      "skills": ["JavaScript", "Python", "React"]
    },
    {
      "id": 2,
      "name": "Charlie Brown",
      "details": {
        "age": 32,
        "occupation": "Data Scientist",
        "address": {
          "street": "456 Data Drive",
          "city": "Boston",
          "country": "USA"
        }
      },
      "skills": ["Python", "Machine Learning", "SQL"]
    }
  ],
  "Mixed Types Table": [
    {
      "id": "P001",
      "name": "Smartphone X",
      "price": 799.99,
      "inStock": true,
      "features": ["5G", "Dual Camera", "Face Recognition"],
      "ratings": {
        "average": 4.5,
        "count": 1250
      },
      "lastUpdated": "2023-07-15T10:30:00Z"
    },
    {
      "id": "P002",
      "name": "Laptop Pro",
      "price": 1299.99,
      "inStock": false,
      "features": ["16GB RAM", "512GB SSD", "4K Display"],
      "ratings": {
        "average": 4.8,
        "count": 876
      },
      "lastUpdated": "2023-07-14T14:45:00Z"
    }
  ],
  "Named Array Tables": {
    "Camera": {
      "name": "Canon EOS 6D",
      "price": 799.99,
      "inStock": true
    },
    "Laptop": {
      "name": "Dell XPS 13",
      "price": 1299.99,
      "inStock": false
    },
    "Smartphone": {
      "name": "iPhone 13",
      "price": 999.99,
      "inStock": true
    }
  }
};

/**
 * Home component - The main page of the dataset search application.
 * This component orchestrates the entire functionality of the app, including:
 * - Dataset selection and loading (from file, URL, or examples)
 * - Search interface
 * - Results display
 * - Pagination of results
 */
export default function Home() {
  // Custom hook for managing dataset operations
  const { dataset, uploadDataset, fetchDataset, error } = useDataset();

  // State for managing search results and display
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKey, setSearchKey] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD);
  const [selectedExample, setSelectedExample] = useState<string>("Simple Flat Table");

  /**
   * Effect to initialize results with full dataset or selected example data.
   * This effect runs when the dataset or selected example changes.
   * It ensures that the search results are always in sync with the current dataset.
   */
  useEffect(() => {
    if (dataset.length > 0) {
      setSearchResults(dataset.map(item => ({ item })));
    } else {
      const exampleData = data_examples[selectedExample];
      setSearchResults(Array.isArray(exampleData)
        ? exampleData.map(item => ({ item }))
        : Object.entries(exampleData).map(([key, value]) => ({ item: { id: key, ...value } }))
      );
    }
    setDisplayCount(INITIAL_LOAD);
  }, [dataset, selectedExample]);

  /**
   * Handles file upload for dataset.
   * This function is passed to the FileUpload component.
   */
  const handleFileUpload = async (file: File) => {
    const success = await uploadDataset(file);
    if (!success) {
      console.error('File upload failed');
    }
  };

  /**
   * Callback to handle search results.
   * This function is passed to the Search component and updates the state with new search results.
   * It also resets the display count to show the initial set of results.
   */
  const handleSearchResults = useCallback((results: any[], query: string, key: string | null) => {
    console.log('Search results received:', results.length);
    // Only update state if the results have actually changed
    if (JSON.stringify(results) !== JSON.stringify(searchResults)) {
      setSearchResults(results);
      setSearchQuery(query);
      setSearchKey(key);
      setDisplayCount(INITIAL_LOAD);
    }
  }, [searchResults]);

  /**
   * Handles loading more results for pagination.
   * This function increases the display count, showing more results.
   */
  const handleLoadMore = useCallback(() => {
    console.log('Load More clicked. Current displayCount:', displayCount);
    setDisplayCount(prevCount => {
      const newCount = Math.min(prevCount + LOAD_MORE_COUNT, searchResults.length);
      console.log('New displayCount:', newCount);
      return newCount;
    });
  }, [displayCount, searchResults.length]);

  /**
   * Handles showing all results at once.
   * This function sets the display count to show all available results.
   */
  const handleShowAll = useCallback(() => {
    setDisplayCount(searchResults.length);
  }, [searchResults.length]);

  // Calculate the results to display based on the current display count
  const displayedResults = searchResults.slice(0, displayCount);
  const hasMore = displayCount < searchResults.length;

  /**
   * Handles dataset fetching from a GitHub URL.
   * This function is passed to the GitHubUrlInput component.
   */
  const handleUrlSubmit = async (url: string) => {
    const success = await fetchDataset(url);
    if (!success) {
      console.error('URL fetch failed');
    }
  };

  /**
   * Handles selection of example datasets.
   * This function updates the selected example state when a new example is chosen.
   */
  const handleExampleSelection = (value: string) => {
    setSelectedExample(value);
  };

  // Render the main application UI
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dataset Search</h1>
      <div className="grid grid-cols-1 gap-4">
        {/* File upload section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Upload File</h2>
          <FileUpload onFileUpload={handleFileUpload} />
        </div>
        {/* GitHub URL input section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Fetch from GitHub</h2>
          <GitHubUrlInput onUrlSubmit={handleUrlSubmit} />
        </div>
        {/* Example dataset selection */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Select Example Data</h2>
          <Select onValueChange={handleExampleSelection} value={selectedExample}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an example dataset" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(data_examples).map((example) => (
                <SelectItem key={example} value={example}>
                  {example}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Error display */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      {/* Search component */}
      <Search
        data={dataset.length > 0 ? dataset : data_examples[selectedExample]}
        onSearchResults={handleSearchResults}
      />
      {/* Results display */}
      <Results results={displayedResults} query={searchQuery} searchKey={searchKey} />
      {/* Pagination information */}
      <div className="mt-4 text-center text-gray-600">
        Showing {displayedResults.length} out of {searchResults.length} results
      </div>
      {/* Pagination controls */}
      <div className="mt-4 flex justify-center space-x-4">
        {hasMore && (
          <Button onClick={handleLoadMore}>Load More</Button>
        )}
        {hasMore && (
          <Button onClick={handleShowAll}>Show All</Button>
        )}
      </div>
    </main>
  );
}
