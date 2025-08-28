import React from "react";

type FilterOptionForString = {};
type FilterOptionForNumber = {};
type FilterOptionForDate = {};
type FilterOption<T> = T extends string
  ? FilterOptionForString
  : T extends number
  ? FilterOptionForNumber
  : T extends Date
  ? FilterOptionForDate
  : never;

interface Filter<T extends object> {
  key: string;
  type: keyof T;
  options: FilterOption<T[keyof T]>;
  arguments: unknown[];
}

const withFilter = <T extends object>(
  arr: T[],
  filters: ((item: T) => boolean)[],
  ReactComponent: React.FC<{ item: T }>
) => {
  const filteredItems = React.useMemo(() => {
    return arr.filter((item) => {
      for (const filter of filters) {
        if (!filter(item)) {
          return false;
        }
        // return item && true;
      }
      return true;
    });
  }, [arr, filters]);

  return () => (
    <>
      {filteredItems.map((item) => (
        <ReactComponent item={item} key="" />
      ))}
    </>
  );
};

export default withFilter;
