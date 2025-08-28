import { Fragment } from "react";

import { Transition } from "@headlessui/react";
import { RiBuilding2Fill, RiQuestionLine, RiSearch2Line } from "react-icons/ri";

const NoOrgTransition: React.FC<{ show: boolean }> = ({ show }) => {
  return (
    <Transition
      as={Fragment}
      show={show}
      enter="duration-300 ease-in delay-300"
      enterFrom="scale-90 opacity-0"
      enterTo="scale-100 opacity-100"
      leave="duration-500 ease-out"
      leaveFrom="scale-100 opacity-100"
      leaveTo="scale-50 opacity-0"
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-black/20 shadow-2xl shadow-base/10">
          <RiBuilding2Fill
            size={100}
            className="absolute z-0 text-white opacity-50"
          />
          <Transition.Child
            as={"div"}
            className="absolute flex h-full w-full items-center justify-center"
            enter="duration-[5s] ease-out delay-700"
            enterFrom="scale-50 opacity-0"
            enterTo="opacity-100 scale-100"
          >
            <div className="rotate-cw grid h-32 w-32 transform-gpu grid-cols-2 grid-rows-2 [animation-duration:7s] [animation-iteration-count:1] [animation-timing-function:ease-out]">
              <div className="rotate-ccw flex h-full w-full items-center justify-center [animation-duration:7s] [animation-iteration-count:1] [animation-timing-function:ease-out]">
                <RiSearch2Line className="text-white" size={80} />
              </div>

              <div className="rotate-ccw col-span-1 col-start-2 row-span-1 row-start-2 flex h-full w-full items-center justify-center [animation-duration:7s] [animation-iteration-count:1] [animation-timing-function:ease-out]">
                <RiQuestionLine className="text-white/70" size={40} />
              </div>
            </div>
          </Transition.Child>
        </div>
      </div>
    </Transition>
  );
};

export default NoOrgTransition;
