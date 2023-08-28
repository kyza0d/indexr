import { useEffect, useState } from "react";

export const useLocalStorage = (key: string, initialValue: unknown) => {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    const jsonValue = localStorage.getItem(key);
    if (jsonValue != null) return JSON.parse(jsonValue);
    if (typeof initialValue === "function") return initialValue();
    return initialValue;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && value !== undefined) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return { value, setValue };
};
