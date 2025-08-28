import { useLocation } from "react-router-dom";

const UniversalSearch: React.FC = () => {
  const location = useLocation();

  return (
    <div className="mx-0 h-10 max-w-2xl flex-grow rounded-xl  md:mx-2 lg:mx-10">
      <input
        className="h-full w-full rounded-xl bg-transparent px-4 py-2"
        placeholder="Search..."
      />
    </div>
  );
};

export default UniversalSearch;
