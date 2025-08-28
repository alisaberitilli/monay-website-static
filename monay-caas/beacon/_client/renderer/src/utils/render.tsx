export type ListViewOpts = {
  active?: boolean;
  selected?: boolean;
};
export type RenderListView<T> = (
  item: T,
  opts: ListViewOpts
) => React.ReactElement<T, string | React.JSXElementConstructor<T>>;
export const renderListView = <T extends object>(Component: React.FC<T>) => {
  return (item: T, { active, selected }: ListViewOpts) => (
    <div className="relative">
      <div
        className={`pointer-events-none absolute h-full w-full rounded ${
          selected
            ? "bg-purple-950/20 dark:bg-purple-50/10"
            : active
            ? "bg-purple-950/10 dark:bg-purple-50/10"
            : "bg-transparent dark:bg-transparent"
        }`}
      />
      <Component {...item} />
    </div>
  );
};
