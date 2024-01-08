export const debounce = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const concat = (...args: (string | undefined)[]) => {
  return args.filter(Boolean).join(" ");
};
