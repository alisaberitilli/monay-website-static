import { RiCodeSSlashFill } from "react-icons/ri";
import { useParams } from "react-router-dom";

const underConstruction = [/.*/];

type Content = string | JSX.Element;
interface ContentRecord {
  notFound: Content;
  inDev: Content;
}
const pageContent: Record<string, ContentRecord> = {
  watermark: {
    notFound: "404",
    inDev: <RiCodeSSlashFill />,
  },
  title: {
    notFound: "Content Not Found",
    inDev: "Under Construction",
  },
  content: {
    notFound: "does not exist",
    inDev: "is currently in development",
  },
};

const NotFoundPage: React.FC = () => {
  const params = useParams();
  const pageUrl = params["*"] ?? window.location.pathname;

  const pageUnderConstruction = underConstruction.some((path) =>
    new RegExp(path).test(pageUrl)
  );
  const contentKey = pageUnderConstruction ? "inDev" : "notFound";

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute left-0 top-0 z-0 mb-8 flex h-full w-full select-none items-center justify-center text-[20vw] font-black text-light/40 dark:text-dark/20">
        {pageContent.watermark[contentKey]}
      </div>
      <div className="z-10 text-center">
        <h1 className="text-3xl font-bold md:text-6xl">
          {pageContent.title[contentKey]}
        </h1>
        <div className="mt-4 px-8 text-center text-xl font-bold">
          The requested url at{" "}
          <code className="rounded bg-black/80 px-2 text-base">/{pageUrl}</code>{" "}
          {pageContent.content[contentKey]}. Please check back later.
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
