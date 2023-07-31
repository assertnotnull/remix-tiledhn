import { useEffect, useState } from "react";

export function useLocalStorage(key: string) {
  const [state, setState] = useState<string | null>(null);

  useEffect(() => {
    setState(localStorage.getItem(key));
  }, [key]);

  const setWithLocalStorage = (nextState: string) => {
    setState(nextState);
  };

  return [state, setWithLocalStorage];
}
