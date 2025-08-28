import { cva } from "class-variance-authority";
import type { IconBaseProps, IconType } from "react-icons/lib";
import {
  RiLoader2Line,
  RiLoader3Line,
  RiLoader4Line,
  RiLoader5Line,
  RiLoaderLine,
} from "react-icons/ri";

import { isElectron } from "#client/utils/platform";

const loadingVariants = cva(["animate-spin", "duration-300"]);

type LoaderStyle =
  | "apple"
  | "material"
  | "apple-small"
  | "material-small"
  | "default";
const loadMap: Record<LoaderStyle, IconType> = {
  default: RiLoader3Line,
  apple: RiLoader2Line,
  "apple-small": RiLoaderLine,
  "material-small": RiLoader5Line,
  material: RiLoader4Line,
};
const Loading: React.FC<IconBaseProps & { type?: LoaderStyle }> = ({
  children,
  type = !isElectron() || window.electron.process.platform === "darwin"
    ? "apple"
    : "default",
  ...props
}) => {
  const LoadIcon = loadMap[type];
  return (
    <LoadIcon
      {...props}
      className={loadingVariants({ className: props.className })}
    >
      {children}
    </LoadIcon>
  );
};

export default Loading;
