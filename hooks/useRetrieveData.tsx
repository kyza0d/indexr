import { useState } from "react";

interface Item {
  [key: string]: string;
}

const useRetrieveData = (itemsFile: string) => {
  const [error, setError] = useState<Error | null>(null);

  const loadItems = async (): Promise<Item[]> => {
    try {
      const response = await fetch(itemsFile);
      const jsonData: unknown = await response.json();

      if (Array.isArray(jsonData)) {
        if (jsonData[0]._id) {
          const items: Item[] = jsonData.map((item: any) => {
            const keys = Object.keys(item);
            const newItem: Item = { id: item._id };
            keys.forEach((key) => {
              newItem[key] = typeof item[key] === "object" ? JSON.stringify(item[key]) : item[key];
            });
            return newItem;
          });
          return items;
        } else {
          return jsonData as Item[];
        }
      } else if (typeof jsonData === "object") {
        const items: Item[] = [];
        for (const [key, value] of Object.entries(jsonData as object)) {
          const newItem: Item = { id: key };
          const keys = Object.keys(value);
          keys.forEach((k) => {
            newItem[k] = typeof value[k] === "object" ? JSON.stringify(value[k]) : value[k];
          });
          items.push(newItem);
        }
        return items;
      } else {
        throw new Error("Invalid JSON format");
      }
    } catch (error) {
      console.error("Failed to load items:", error);
      setError(error as Error);
      return [];
    }
  };

  return { loadItems, error };
};

export default useRetrieveData;
