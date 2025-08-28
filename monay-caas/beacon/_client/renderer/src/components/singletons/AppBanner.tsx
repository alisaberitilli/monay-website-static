import React from "react";

import { type VariantProps, cva } from "class-variance-authority";
import { AiFillWarning } from "react-icons/ai";
import { BiSolidCommentError } from "react-icons/bi";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { IconBaseProps, IconType } from "react-icons/lib";
import { MdAnnouncement, MdPending } from "react-icons/md";

import { IconButton, Loading } from "../atoms";
import Button, { ButtonProps } from "../atoms/Button";

const appBannerVariants = cva(
  ["w-full", "px-8 py-3", "border-solid border-b-2"],
  {
    variants: {
      warningLevel: {
        Success: [
          "bg-green-500",
          "text-white",
          "font-bold",
          "border-b-green-700",
        ],
        Pending: [
          "bg-blue-500",
          "text-white",
          "font-bold",
          "border-b-blue-700",
        ],
        Announcement: [
          "bg-pink-500",
          "text-white",
          "font-bold",
          "border-b-pink-700",
        ],
        Warning: [
          "bg-amber-500",
          "text-white",
          "font-medium",
          "border-b-amber-700",
        ],
        Error: ["bg-red-500", "text-white", "font-bold", "border-b-red-700"],
      },
      LeftIcon: {
        true: ["pl-12"],
        false: null,
      },
    },
    defaultVariants: {
      warningLevel: "Warning",
    },
  }
);

type AppBannerIconType =
  | "success"
  | "pending"
  | "announcement"
  | "warning"
  | "error";
const appBannerIconMap: Record<AppBannerIconType, IconType | SvgComponent> = {
  success: IoCheckmarkDoneCircle,
  pending: MdPending,
  announcement: MdAnnouncement,
  warning: AiFillWarning,
  error: BiSolidCommentError,
};

const appBannerIconInputType = (_label?: string) => {
  const label = _label?.toLocaleLowerCase();
  if (label && label in appBannerIconMap) {
    return appBannerIconMap[label];
  }
  return undefined;
};

interface AppBannerProps<
  U extends IconType | SvgComponent | SvgComponent | React.ReactNode
> extends Omit<VariantProps<typeof appBannerVariants>, "LeftIcon"> {
  className?: string;
  LeftIcon?: U;
  rightIconButtons?: {
    display: string;
    onClick?: () => void;
    buttonProps?: ButtonProps | undefined;
  }[];
}

const AppBanner = <
  U extends IconType | SvgComponent | SvgComponent | React.ReactNode
>({
  className,
  warningLevel,
  LeftIcon,
  rightIconButtons = [],
  ...props
}: React.PropsWithChildren<AppBannerProps<U>>) => {
  const renderIcon = () =>
    LeftIcon && (
      <div className="absolute left-0 top-0 z-0 flex h-full items-center justify-center rounded-l-md pl-3 text-light dark:text-dark">
        <IconButton Icon={LeftIcon} />
      </div>
    );

  const renderButtons = (): React.ReactNode[] =>
    rightIconButtons.map(({ display, onClick, buttonProps }) => {
      return (
        <div className="absolute right-0 top-0 z-0 flex h-full items-center justify-center rounded-l-md pl-3 text-light dark:text-dark">
          <Button onClick={onClick} {...buttonProps}>
            {appBannerIconInputType(display)}
          </Button>
        </div>
      );
    });

  return (
    <div
      className={`${appBannerVariants({
        className,
        warningLevel,
      })}flex flex-row items-center`}
    >
      {renderIcon()}
      {renderButtons()}
    </div>
  );
};

export default AppBanner;
