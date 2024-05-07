
import { useState, useEffect } from "react";

interface Item {
  [key: string]: string;
}

const useDataHandling = (
  loadItems: () => Promise<Item[]>,
  config: any,
  setConfig: (config: any) => void,
  setNames: (names: Item[]) => void
) => {
  const [uniqueKeys, setUniqueKeys] = useState<Set<string>>(new Set());
  const [firstKey, setFirstKey] = useState<string | null>(null);

  useEffect(() => {
    loadNames();
  }, []);

  const loadNames = async () => {
    const items = await loadItems();
    setNames(items);

    const keys: { [key: string]: boolean | string } = {};
    const newKeys = new Set<string>();  // Temporary set to collect keys

    items.forEach((item, index) => {
      Object.keys(item).forEach((key, kindex) => {
        if (index === 0 && kindex === 0) {
          setFirstKey(key);
        }
        newKeys.add(key);  // Add to the temporary set

        if (config.keys && !(key in config.keys)) {
          keys[key] = true;
        } else if (config.keys) {
          keys[key] = config.keys[key];
        }
      });
    });

    setUniqueKeys(newKeys);  // Update the state once after collecting all keys

    setConfig((prevConfig: any[]) => ({
      ...prevConfig,
      keys: keys,
    }));
  };

  return { uniqueKeys, loadNames, firstKey };
};

export default useDataHandling;
