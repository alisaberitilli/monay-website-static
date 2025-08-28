import { type VariantProps, cva } from "class-variance-authority";

import "#client/assets/container.css";

const containerClasses = cva(["relative"], {
  variants: {
    type: {
      default: [
        "border border-white border-opacity-50",
        "bg-blue-200 bg-opacity-10",
        "rounded-[10px]",
      ],
      neu: ["neu", "rounded-[12px]", "bg-base"],
      list: [
        "container-list",
        "rounded-[10px]",
        "border-solid border-2 border-white/50 dark:border-white/5",
        "bg-list/10",
      ],
      dropdown: ["dropdown", "bg-base", "rounded-[10px]"],
      neuList: [
        "neuList", 
        "bg-[#F1F5F9]",
        "rounded-[12px]",
        "border border-stoke-widget border-white"
      ]
    },
    padding: {
      xs: ["px-[10px]", "py-[5px]"],
      sm: ["px-4", "py-3"],
      md: ["p-5"],
      lg: ["p-[40px]"],
    },
    block: {
      true: ["w-full"],
      false: null,
    },
  },
  defaultVariants: {
    block: true,
    type: "default",
    padding: "md",
  },
});

export interface ContainerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof containerClasses>,
    BaseContainerProps {
  title?: React.ReactNode;
  block?: boolean;
}
const Container: React.FC<ContainerProps> = ({
  title = null,
  children,
  className,
  block,
  type,
  padding,
  ...props
}) => {
  return (
    <>
      {type !== "neu" && title}
      <div
        className={containerClasses({ className, block, type, padding })}
        {...props}
      >
        {children}
      </div>
    </>
  );
};

export default Container;
