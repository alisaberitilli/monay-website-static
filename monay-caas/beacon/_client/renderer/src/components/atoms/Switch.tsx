import { Switch as TailSwitch } from "@headlessui/react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  altText: string;
  heightOverride?: number;
  widthOverride?: number;
}
const Switch: React.FC<React.PropsWithChildren<SwitchProps>> = ({
  checked,
  onChange,
  altText,
  children,
}) => {
  return (
    <TailSwitch
      checked={checked}
      onChange={onChange}
      className={`${
        checked ? "bg-lightbg" : "bg-darkbg"
      } switch relative inline-flex h-4 w-8 items-center rounded-full`}
    >
      <span className="sr-only">{altText}</span>
      <span
        className={`${
          checked ? "translate-x-4" : "translate-x-0.5"
        } flex h-3.5 w-3.5 transform items-center justify-center rounded-full bg-slate-400 transition dark:bg-base`}
      >
        {children}
      </span>
    </TailSwitch>
  );
};

export default Switch;
