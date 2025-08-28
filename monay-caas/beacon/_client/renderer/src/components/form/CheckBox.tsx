import { forwardRef } from "react";

import { type VariantProps, cva } from "class-variance-authority";
import { Path, UseFormRegister } from "react-hook-form";

const checkboxVariants = cva(["rounded-md"], {
  variants: {},
  defaultVariants: {},
});

export interface CheckboxProps<T extends object>
  extends React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    VariantProps<typeof checkboxVariants> {
  className?: string;
  label?: string;
  register: UseFormRegister<T>;
  name: Path<T>;
  deps?: Path<T>[];
}
const Checkbox = <T extends object>({
  name,
  className,
  label,
  register,
  deps,
  ...props
}: CheckboxProps<T>): JSX.Element => {
  return (
    <div className={checkboxVariants({ className })}>
      <label className="flex flex-row items-center gap-2">
        <input
          className="rounded-md text-purple-two"
          type="checkbox"
          {...props}
          {...register(name, { deps, required: props.required })}
          aria-label={props["aria-label"] ?? label ?? name}
          aria-required={props.required ?? false}
        />
        {label}
      </label>
    </div>
  );
};
export default Checkbox;
