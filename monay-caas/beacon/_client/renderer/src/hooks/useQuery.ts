import { useMemo } from "react";

import { useLocation } from "react-router-dom";

const useQuery = <
  T extends Partial<Record<string, string>> = Record<string, string>
>() => {
  const { search } = useLocation();
  const params = useMemo(() => {
    const params = new URLSearchParams(search);
    const paramObject = {} as Partial<T>;
    for (const [param, value] of params.entries()) {
      paramObject[param as keyof T] = value as T[keyof T];
    }
    return paramObject;
  }, [search]);

  return params;
};

export default useQuery;
