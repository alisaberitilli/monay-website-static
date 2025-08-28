import { Fragment, useState } from "react";

import { Float } from "@headlessui-float/react";
import { Popover, Transition } from "@headlessui/react";
import type { IconBaseProps } from "react-icons/lib";
import { RiInformationFill } from "react-icons/ri";

interface HintProps {
  iconProps?: IconBaseProps;
  className?: string;
  position?: string;
  maxWidth?: string;
  size?: number;
}
const Hint: React.FC<React.PropsWithChildren<HintProps>> = ({
  children,
  iconProps = {},
  position = "left-1/2 -translate-x-1/2",
  maxWidth = "max-w-xs",
  size = 12,
  className = "",
}) => {
  return (
    <div className={`flex ${className}`}>
      <Popover className="relative">
        {({ open }) => (
          <Float>
            <Popover.Button className="rounded-full">
              <RiInformationFill
                size={size}
                className={`${
                  open ? "ring-1 ring-base" : ""
                } rounded-full text-base transition-colors duration-150 hover:text-purple-500 focus:border-none focus:ring-base dark:text-base`}
                {...iconProps}
              />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                className="min-w-xs z-[1000]"
                // className={`absolute z-10 mt-3 w-screen transform px-4 sm:px-0 ${position} ${maxWidth}`}
              >
                <div className="overflow-hidden rounded shadow-lg ring-2 ring-inset ring-black/5">
                  <div className="bg-zinc-100/90 px-4 py-3 text-sm backdrop-blur-sm dark:bg-zinc-900/80">
                    {children}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </Float>
        )}
      </Popover>
    </div>
  );
};

export default Hint;
