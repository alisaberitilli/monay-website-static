import React, { ComponentType, useState } from "react";

interface SortOption<T> {
  label: string;
  value: string;
  sort?: (a: T, b: T) => number;
}

interface SortProps<T> {
  data: T[];
  children: React.ReactNode;
}

const withSort = <T extends object>(
  options: SortOption<T>[],
  sortKey: keyof T,
  WrappedComponent: ComponentType<SortProps<T>>
) => {
  const SortComponent: React.FC<SortProps<T>> = ({ data, children }) => {
    const [sortedData, setSortedData] = useState<T[]>(data);
    const [sortOrder, setSortOrder] = useState<SortOption<T> | null>(null);

    const handleSort = (option: SortOption<T> | undefined) => {
      let sortedResult: T[] = [];

      if (option) {
        if (option.value === sortKey && sortOrder?.value === option.value) {
          sortedResult = sortedData.slice().reverse();
        } else {
          sortedResult = data.slice().sort((a, b) => {
            if (option.sort) {
              return option.sort(a, b);
            }

            if (a[sortKey] < b[sortKey]) {
              return -1;
            }
            if (a[sortKey] > b[sortKey]) {
              return 1;
            }
            return 0;
          });
        }

        setSortedData(sortedResult);
        setSortOrder(option);
      }
    };

    return (
      <WrappedComponent data={sortedData}>
        {children}
        <div>
          <select
            onChange={(e) =>
              handleSort(
                options.find((option) => option.value === e.target.value)
              )
            }
          >
            <option value="">None</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </WrappedComponent>
    );
  };

  return SortComponent;
};

export default withSort;
