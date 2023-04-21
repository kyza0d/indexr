"use strict";

// Import CSS stylesheet
import "./style.css";

// Import fuzzy search library
import Fuse from "fuse.js";

// Define the structure of an item
interface Item {
  Name: string;
  Icon: string;
}

// Load items from a JSON file
async function loadItems(): Promise<Item[]> {
  const response = await fetch("/items.json");
  return response.json();
}

// Get a reference to the container element
const container = document.querySelector("#names")!;

// Render names in the container
async function renderNames(query?: string): Promise<void> {
  // Load the items
  const items = await loadItems();

  // Extract names from the loaded items
  const names = items.map(({ Name }: Item) => Name);

  // Clear the container
  container.innerHTML = "";

  // If no search query or the query is too short, render all names
  if (!query || query.length < 2) {
    names.forEach((name: string) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = name;
      container.appendChild(paragraph);
    });
  } else {
    // Create a fuzzy search instance
    const fuse = new Fuse(names, {
      keys: ["Name"],
      threshold: 0.2,
      includeMatches: true,
    });

    // Search for the query in the names
    const searchResults = fuse.search(query);

    // Render the search results
    searchResults.forEach(({ item, matches }: any) => {
      const paragraph = document.createElement("p");
      let highlightedText = "";
      let lastIndex = 0;
      matches.forEach(({ indices }: any) => {
        indices.forEach(([start, end]: number[]) => {
          highlightedText += `${item.slice(lastIndex, start)}<mark>${item.slice(
            start,
            end + 1
          )}</mark>`;
          lastIndex = end + 1;
        });
      });
      highlightedText += item.slice(lastIndex);
      paragraph.innerHTML = highlightedText;
      container.appendChild(paragraph);
    });
  }
}

// Render all names when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  renderNames();
});

// Define a debounce function
const debounce = (fn: Function, delay: number) => {
  let timeoutId: number;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Get a reference to the search input element
const searchInput = document.querySelector("#search") as HTMLInputElement;

// Render names when the search input value changes
searchInput.addEventListener(
  "input",
  debounce(({ target }: Event) => {
    const query = (target as HTMLInputElement).value;
    renderNames(query);
  }, 200)
);
