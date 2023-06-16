import { useRef, useEffect } from "react";
import Fuse from "fuse.js";

// Interface for the item object
interface Item {
  [key: string]: string;
}

const useFuse = (names: Item[], options: Fuse.IFuseOptions<Item>) => {
  const fuse = useRef<Fuse<Item> | null>(null);

  useEffect(() => {
    // Initialize the Fuse instance when the names data changes
    fuse.current = new Fuse(names, options);
  }, [names, options]);

  return fuse.current;
};

export default useFuse;
