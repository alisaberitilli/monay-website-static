import { Fragment, useState } from "react";

import { Combobox, Transition } from "@headlessui/react";

import { RenderListView } from "#client/utils/render";

import { Hint, Loading } from "../atoms";
import { TextInputProps, baseInputVariants, labelVariants } from "./TextInput";

let hasWarned = false;

interface ComboBoxProps<T extends object | string> extends TextInputProps<{}> {
  initial?: T;
  display: T extends object ? keyof T : never;
  items: T[];
  filter?: (item: T) => boolean;
  onSelectItem?: (item: T) => void;
  renderItem: RenderListView<T>;
  loading?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
  type?: React.HTMLInputTypeAttribute;
  onQuery?: (query: string) => void;
  prefiltered?: boolean;
  float?: boolean;
}
const ComboBox = <T extends object | string>({
  initial,
  display,
  items,
  filter,
  onSelectItem,
  renderItem,
  loading = false,
  placeholder,
  label,
  className,
  type,
  onQuery,
  prefiltered,
  labelProps,
  hideLabel,
  description,
  descriptionProps,
  error,
  errorProps,
  inputClassName,
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
  float,
  ref,
  ...props
}: ComboBoxProps<T>) => {
  const [selected, setSelected] = useState(initial);
  const [query, setQuery] = useState("");

  const filteredCombo = prefiltered
    ? items
    : query === ""
    ? items
    : items.filter((item: T) => {
        if (filter) return filter(item);
        else {
          if (typeof item === "string") {
            return item.includes(query);
          } else {
            // if this ever executes you are doing something terribly wrong
            if (!hasWarned) {
              console.warn(
                "YOU ARE USING THE COMBOBOX COMPONENT WITHOUT A PROPER FILTER FUNCTION. PLEASE FIX THIS IMMEDIATELY.",
                items
              );
              hasWarned = true;
            }
            return Object.values(item)
              .filter((prop) => typeof prop === "string")
              .includes(query);
          }
        }
      });

  const onChange = (value: T) => {
    setSelected(value);
    onSelectItem?.(value);
  };

  const getDisplayValue = (item: T | number | string | readonly string[]) => {
    if (typeof selected === "object" && typeof item === "object") {
      return (item as T)[display] as string;
    }
    return selected as string;
  };

  const onChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    onQuery?.(event.target.value);
  };

  const inputClasses = baseInputVariants({
    formSize,
    disabled,
    LeftIcon: !!LeftIcon || inferIcon,
    RightIcon: !!RightIcon,
    className: inputClassName,
  });
  const labelClasses = labelVariants({ ...labelProps, hidden: hideLabel });

  return (
    <div className="relative">
      <Combobox value={selected} onChange={onChange} defaultValue={initial}>
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
          <Combobox.Input
            onChange={onChangeQuery}
            placeholder={placeholder}
            displayValue={getDisplayValue}
            type={type}
            className={inputClasses}
            {...props}
          />
        </div>
        <Combobox.Options
          className={`w-full rounded ${
            float &&
            "absolute bottom-20 left-0 bg-slate-500/10 p-4 backdrop-blur"
          }`}
        >
          <Transition
            show={false}
            as={Fragment}
            enter="duration-75"
            enterFrom="opacity-20 scale-0 h-0"
            enterTo="opacity-100 scale-100 h-[20px]"
            leave="duration-75"
            leaveFrom="opacity-100 scale-100 h-[20px]"
            leaveTo="opacity-0 scale-0 h-0"
          >
            <div className="flex w-full items-center justify-center">
              <Loading size={20} />
            </div>
          </Transition>
          {filteredCombo.map((item) => (
            <Combobox.Option
              key={typeof item === "object" ? item[display] : item}
              value={item}
              as={"div"}
              className="cursor-pointer"
            >
              {({ active, selected }) => renderItem(item, { active, selected })}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );
};

export default ComboBox;
