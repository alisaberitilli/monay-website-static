import { type VariantProps, cva } from "class-variance-authority";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { IconBaseProps, IconType } from "react-icons/lib";
import {
  RiContactsFill,
  RiLinksFill,
  RiMailAddFill,
  RiMapPinFill,
  RiPhoneFill,
} from "react-icons/ri";

import { Hint, Loading } from "../atoms";

export const baseInputVariants = cva(
  ["w-full", "relative", "rounded-md", "outline-none"],
  {
    variants: {
      base: {
        default: [
          "focus:ring-indigo-300/50 focus:dark:ring-indigo-300/50 focus:ring-inset focus:ring-2",
          "bg-slate-400/20 dark:bg-black/40",
          "text-light dark:text-dark",
          "border-none",
        ],
        neu: [
          "rounded-[5px]",
          "opacity-70",
          "bg-base",
          "text-input-shadow",
          "border border-solid border-white",
        ],
        search: [
          "rounded-[8px]",
          "bg-base",
          "shadow-inner",
          "border-[#FFF]",
          "border-[2px]"
        ],
      },
      formSize: {
        sm: ["text-sm py-2 px-3"],
        md: ["text-md py-3 px-4"],
        lg: ["text-lg py-4 px-6"],
      },
      disabled: {
        true: ["opacity-75"],
        false: null,
      },
      LeftIcon: {
        true: ["pl-12"],
        false: null,
      },
      RightIcon: {
        true: ["pr-12"],
        false: null,
      },
    },
    defaultVariants: {
      formSize: "md",
      disabled: false,
      base: "default",
    },
  }
);

export const labelVariants = cva(
  ["text-md", "font-medium", "text-zinc-950", "dark:text-zinc-50"],
  {
    variants: {
      hidden: {
        true: ["hidden"],
        false: ["block"],
      },
    },
    defaultVariants: {
      hidden: false,
    },
  }
);

const descriptionVariants = cva(
  ["text-sm", "text-zinc-800", "dark:text-zinc-400"],
  {
    variants: {},
    defaultVariants: {},
  }
);

const errorVariants = cva(["text-sm", "text-red-500", "font-medium"], {
  variants: {},
  defaultVariants: {},
});

const containerVariants = cva(["flex", "flex-col", "relative"], {
  variants: {
    block: {
      true: ["w-full"],
      false: ["min-w-[100px] w-auto"],
    },
  },
  defaultVariants: {
    block: true,
  },
});

type InferredIconType = Extract<React.HTMLInputTypeAttribute, "email"> & "name";
const inferredIconMap: Record<InferredIconType, IconType | SvgComponent> = {
  email: RiMailAddFill,
  name: RiContactsFill,
  website: RiLinksFill,
  url: RiLinksFill,
  phone: RiPhoneFill,
  tel: RiPhoneFill,
  address: RiMapPinFill,
};

const inferIconFromInputType = (
  type?: React.HTMLInputTypeAttribute,
  _label?: string
) => {
  const label = _label?.toLocaleLowerCase();
  if (type && type in inferredIconMap) {
    return inferredIconMap[type];
  }
  if (label && label in inferredIconMap) {
    return inferredIconMap[label];
  }
  return undefined;
};

export interface TextInputProps<
  T extends FieldValues,
  U extends IconType | SvgComponent | React.ReactNode =
    | IconType
    | SvgComponent
    | React.ReactNode
> extends Omit<
      React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
      >,
      "disabled"
    >,
    Omit<VariantProps<typeof baseInputVariants>, "LeftIcon" | "RightIcon">,
    VariantProps<typeof containerVariants> {
  label?: string;
  labelProps?: VariantProps<typeof labelVariants>;
  hideLabel?: boolean;
  description?: string;
  descriptionProps?: VariantProps<typeof descriptionVariants>;
  error?: string | boolean;
  errorProps?: VariantProps<typeof errorVariants>;
  className?: string;
  inputClassName?: string;
  loading?: boolean;
  register?: UseFormRegister<T>;
  name?: Path<T>;
  deps?: Path<T>[];
  inferIcon?: boolean;
  LeftIcon?: U;
  leftIconProps?: U extends IconType ? IconBaseProps : SvgProps;
  RightIcon?: U;
  rightIconProps?: U extends IconType ? IconBaseProps : SvgProps;
  textarea?: boolean;
  labelHint?: string;
  labelUrl?: string;
  placeholder?: string;
  hintProps?: {
    position?: string;
    maxWidth?: string;
  };
}
const TextInput = <T extends object>({
  label,
  labelProps,
  hideLabel,
  description,
  descriptionProps,
  error,
  errorProps,
  className,
  inputClassName,
  loading,
  block,
  formSize,
  disabled,
  register,
  deps,
  name,
  LeftIcon,
  leftIconProps = {},
  RightIcon,
  rightIconProps = {},
  inferIcon,
  textarea = false,
  labelHint,
  labelUrl,
  hintProps = {},
  placeholder,
  base = "default",
  ...props
}: TextInputProps<T>) => {
  const inputClasses = baseInputVariants({
    formSize,
    disabled,
    LeftIcon: !!LeftIcon || inferIcon,
    RightIcon: !!RightIcon,
    className: inputClassName,
    base,
  });
  const containerClasses = containerVariants({ block, className });
  const labelClasses = labelVariants({ ...labelProps, hidden: hideLabel });
  const descriptionClasses = descriptionVariants(descriptionProps);
  const errorClasses = errorVariants(errorProps);

  const renderIcon = (type: "left" | "right") => {
    const iconMap: Record<
      "left" | "right",
      IconType | SvgProps | React.ReactNode | undefined
    > = {
      left: LeftIcon as IconType | SvgProps | React.ReactNode | undefined,
      right: RightIcon as IconType | SvgProps | React.ReactNode | undefined,
    };
    const Icon =
      iconMap[type] ??
      (inferIcon &&
        type === "left" &&
        inferIconFromInputType(props.type, label));

    const positionClass = type === "left" ? "left-0" : "right-0";
    const iconProps = type === "left" ? leftIconProps : rightIconProps;

    return Icon ? (
      <div
        className={`absolute top-0 ${positionClass} z-0 flex h-full items-center justify-center rounded-l-md pl-3 text-light dark:text-dark ${
          loading && "opacity-40"
        }`}
      >
        {typeof Icon === "function" ? <Icon size={20} {...iconProps} /> : Icon}
      </div>
    ) : null;
  };

  return (
    <div className={containerClasses}>
      <div className="flex w-full items-start">
        <label className={labelClasses}>{label}</label>
        {labelHint && (
          <Hint
            className="ml-1"
            position="right-0 translate-x-1/2"
            {...hintProps}
          >
            {labelHint}{" "}
            {labelUrl && (
              <div className="mt-1 rounded bg-black/50 p-1 text-center">
                <a
                  href={labelUrl}
                  className="text-blue-600 transition-all duration-150 hover:text-blue-400"
                  target="_blank"
                  rel="noreferrer"
                >
                  Learn More
                </a>
              </div>
            )}
          </Hint>
        )}
      </div>
      <div className="relative w-full items-center">
        {textarea ? (
          // @ts-expect-error prop spread to text area is invalid here but no problematic fields are really being passed so this does not matter
          <textarea
            className={inputClasses}
            aria-label={props["aria-label"] ?? label ?? name}
            aria-required={props.required ?? false}
            {...props}
            {...register?.(name as Path<T>, { deps, required: props.required })}
          />
        ) : (
          <input
            className={inputClasses}
            aria-label={props["aria-label"] ?? label ?? name}
            aria-required={props.required ?? false}
            placeholder={placeholder}
            {...props}
            {...register?.(name as Path<T>, { deps, required: props.required })}
          />
        )}
        {loading && (
          <div className="absolute left-0 top-0 z-[100] flex h-full w-full  items-center pl-2 text-indigo-700 dark:text-indigo-100">
            <Loading size={28} />
          </div>
        )}
        {renderIcon("left")}
        {renderIcon("right")}
      </div>
      {!!description && <div className={descriptionClasses}>{description}</div>}
      {!!error && <span className={errorClasses}>{error}</span>}
    </div>
  );
};
export default TextInput;
