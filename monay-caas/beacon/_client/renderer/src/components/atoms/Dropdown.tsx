import { Fragment } from "react";

import { Menu, Transition } from "@headlessui/react";
import { type VariantProps, cva } from "class-variance-authority";

const dropdownVariants = cva([], {
  variants: {
    intent: {
      bare: [],
      default: [],
    },
    disabled: {
      true: ["opacity-60"],
      false: null,
    },
  },
  defaultVariants: {
    intent: "default",
    disabled: false,
  },
});

interface DropdownProps<T extends object>
  extends VariantProps<typeof dropdownVariants> {
  items: T[];
  position?: string;
  width?: string;
  ItemComponent?: React.FC<T>;
  disabled?: boolean;
  className?: string;
}
const Dropdown = <T extends object>({
  intent,
  children,
  items,
  ItemComponent,
  position = "right-0",
  width = "w-56",
  disabled,
  className,
}: React.PropsWithChildren<DropdownProps<T>>) => {
  const dropdownClasses = dropdownVariants({ intent, disabled, className });
  return (
    <Menu as="div">
      <div className={dropdownClasses}>
        <Menu.Button disabled={disabled}>{children}</Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-300"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute ${position} ${width} mt-2 origin-top-right rounded bg-zinc-100/90 p-2 text-sm backdrop-blur-sm focus:outline-none dark:bg-zinc-900/80`}
        >
          {items.map((Item, i) => {
            const key = i.toString();
            if (typeof Item === "function") {
              const Fc = Item as React.FC;
              return <Fc key={key} />;
            } else if (typeof Item === "object" && Item) {
              if (ItemComponent) {
                return (
                  <ItemComponent
                    key={"key" in Item ? (Item.key as string) : key}
                    {...Item}
                  />
                );
              } else {
                return <div key={key}>{Item as React.ReactNode}</div>;
              }
            } else if (Item) {
              return <div key={key}>{Item as React.ReactNode}</div>;
            }
            return null;
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Dropdown;
