/**
 * Flattens a nested object structure into a single-level object.
 * This function recursively traverses the object, creating dot-notation keys for nested properties.
 * It handles both nested objects and arrays, joining array elements into comma-separated strings.
 * 
 * @param obj - The object to flatten
 * @param prefix - The current key prefix for nested objects (used in recursion)
 * @returns A flattened version of the input object
 */
export const flatten = (obj: Record<string, any>, prefix = ''): Record<string, any> => {
  return Object.keys(obj).reduce((acc: Record<string, any>, k: string) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      if (Array.isArray(obj[k])) {
        // For arrays, join elements and also flatten any nested objects within
        acc[pre + k] = obj[k].join(', ');
        obj[k].forEach((item: any, index: number) => {
          if (typeof item === 'object' && item !== null) {
            Object.assign(acc, flatten(item, `${pre}${k}[${index}]`));
          }
        });
      } else {
        // For nested objects, recurse with updated prefix
        Object.assign(acc, flatten(obj[k], pre + k));
      }
    } else {
      // For primitive values, add to accumulator with current prefix
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

/**
 * Prepares an object for search by combining its original structure with a flattened version.
 * This function is crucial for enabling search across both top-level and nested properties.
 * It preserves the original object structure while adding flattened keys for improved searchability.
 * 
 * @param obj - The object to prepare for search
 * @returns An object that combines the original structure with flattened key-value pairs
 */
export const flattenForSearch = (obj: Record<string, any>): Record<string, any> => {
  const flattened = flatten(obj);
  return { ...obj, ...flattened };
};

/**
 * Processes a single item, converting it into a standardized format for search indexing.
 * This function handles both object and primitive types, ensuring consistent structure.
 * For objects, it flattens the structure and assigns an id. For primitives, it wraps them in an object.
 * 
 * @param item - The item to process
 * @param key - An optional key to use as the item's id
 * @returns A processed item ready for indexing
 */
const processItem = (item: any, key?: string): Record<string, any> => {
  if (typeof item === 'object' && item !== null) {
    return {
      id: key || 'root',
      ...flatten(item)
    };
  } else {
    return {
      id: key || 'item',
      value: item
    };
  }
};

/**
 * Parses a JSON structure into a format suitable for search indexing.
 * This function handles various JSON structures: arrays, objects, and primitive values.
 * It processes each element or key-value pair, creating a consistent array output for indexing.
 * 
 * @param json - The JSON data to parse
 * @returns An array of processed items ready for search indexing
 */
const parseJSON = (json: unknown): any[] => {
  if (Array.isArray(json)) {
    return json.flatMap((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return Object.entries(item).map(([key, value]) => processItem(value, key));
      } else {
        return [processItem(item, `item_${index}`)];
      }
    });
  } else if (typeof json === 'object' && json !== null) {
    return Object.entries(json).map(([key, value]) => processItem(value, key));
  } else {
    return [processItem(json)];
  }
};

import { parseCSV } from './parseCSV';

/**
 * Parses data from a file, supporting both JSON and CSV formats.
 * This function acts as the main entry point for data processing in the application.
 * It determines the file type, reads the file content, and delegates to appropriate parsing functions.
 * 
 * @param file - The file object to parse
 * @returns A promise that resolves to an array of parsed and processed data items
 */
export const parseData = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          resolve(parseJSON(json));
        } catch (error) {
          console.error('JSON parsing error:', error);
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    } else if (file.type === 'text/csv') {
      parseCSV(file).then(resolve).catch(reject);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
};
