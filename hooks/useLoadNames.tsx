import { useState, useEffect } from "react";

interface Item {
  [key: string]: string;
}

const useLoadNames = (
  loadItems: () => Promise<Item[]>,
  config: any,
  setConfig: (config: any) => void,
  setNames: (names: Item[]) => void
) => {
  const [uniqueKeys, setUniqueKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadNames();
  }, []);

  const loadNames = async () => {
    const items = await loadItems();

    setNames(items);

    const keys: { [key: string]: boolean | string } = {};

    items.forEach((item) => {
      Object.keys(item).forEach((key) => {
        setUniqueKeys((prevKeys) => {
          const newKeys = new Set(prevKeys);
          newKeys.add(key);
          return newKeys;
        });
        if (!(key in config.keys)) {
          keys[key] = true;
        } else {
          keys[key] = config.keys[key];
        }
      });
    });

    setConfig((prevConfig: any[]) => ({
      ...prevConfig,
      keys: keys,
    }));
  };

  return { uniqueKeys, loadNames };
};

export default useLoadNames;
