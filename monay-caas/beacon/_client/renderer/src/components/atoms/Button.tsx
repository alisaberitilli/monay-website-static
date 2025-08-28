import { type VariantProps, cva } from "class-variance-authority";

import Loading from "./Loading";

const buttonVariants = cva(
  [
    "text-md",
    // "disabled:opacity-70",
    "flex",
    "flex-row",
    "justify-center",
    "items-center",
    "transition-all",
    "duration-150",
    "box-border",
    "border border-solid border-white/50",
    "font-semibold",
    "relative",
  ],
  {
    variants: {
      intent: {
        primary: [
          "text-white",
          "bg-gradient-to-r",
          "beacon-btn",
          "before:bg-fadedBg",
        ],
        secondary: ["neu", "text-faded", "bg-fadedBg"],
        destructive: ["bg-gradient-to-br from-red-500 to-red-700"],
        bare: null,
      },
      size: {
        small: ["py-[4px] px-2 text-sm rounded-md leading-none"],
        big: ["py-2 px-4 rounded-lg w-[250px]"],
        default: ["py-2 px-4 rounded-lg"],
      },
      block: {
        true: ["w-full"],
        false: ["w-auto"],
      },
      disabled: {
        true: ["text-opacity-40 cursor-not-allowed"],
        false: ["cursor-pointer"],
      },
      Icon: {
        true: [],
        false: null,
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "default",
      block: false,
    },
    compoundVariants: [
      {
        intent: "primary",
        className: "from-purple-one to-purple-two",
        Icon: false,
      },
      {
        intent: "primary",
        disabled: true,
        className: "from-indigo-400/30 to-indigo-600/30",
        Icon: false,
      },
      {
        intent: ["secondary", "bare"],
        disabled: true,
        className: "opacity-70",
        Icon: false,
      },
      {
        intent: ["primary", "secondary"],
        disabled: false,
        className: "bg-base",
        Icon: true,
      },
    ],
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    Omit<VariantProps<typeof buttonVariants>, "Icon"> {
  loading?: boolean;
  loadingText?: string;
  buttonRef?: React.LegacyRef<HTMLButtonElement>;
  Icon?: SvgComponent | React.ReactNode;
}
const Button: React.FC<ButtonProps> = ({
  intent = "primary",
  size,
  className,
  children,
  block,
  buttonRef,
  loading = false,
  loadingText,
  disabled,
  Icon,
  ...props
}) => {
  return (
    <button
      className={buttonVariants({
        intent,
        size,
        block,
        disabled,
        Icon: !!Icon,
        className,
      })}
      ref={buttonRef}
      disabled={disabled || loading}
      {...props}
    >
      {/* {!!Icon && <Icon />} */}
      {loading ? (
        <div className="flex flex-row gap-2">
          <Loading size={22} />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
};
export default Button;
