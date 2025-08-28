import React, { Fragment } from "react";

import { Dialog, Transition } from "@headlessui/react";

import { noop } from "#constants";

import { Button, Loading } from "../atoms";

interface LoadingScreenProps {
  show?: boolean;
  close: () => void;
  cancellable?: boolean;
  loadingMeta?: React.ReactNode;
}
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  show = false,
  cancellable,
  close,
  loadingMeta,
}) => {
  return (
    <Transition show={show} as={Fragment} unmount={false}>
      <Dialog
        as="div"
        className="relative z-[100]"
        onClose={cancellable ? close : noop}
        unmount={false}
      >
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          unmount={false}
        >
          <div className="fixed inset-0 bottom-0 left-0 right-0 top-0 h-screen w-screen overflow-hidden bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
              unmount={false}
            >
              <Dialog.Panel
                className={`flex transform flex-col items-center overflow-hidden bg-base align-middle shadow-xl transition-all ${
                  loadingMeta || cancellable
                    ? "w-full max-w-xs rounded-2xl px-6 py-12 shadow-base"
                    : "rounded-full p-16 shadow-lg shadow-base/20"
                }`}
              >
                <Loading size={80} />
                {!!loadingMeta && (
                  <Dialog.Title
                    as="h3"
                    className="mt-4 text-3xl font-bold leading-6"
                  >
                    {loadingMeta}
                  </Dialog.Title>
                )}
                {cancellable && (
                  <Button intent="destructive" className="mt-8" onClick={close}>
                    Cancel
                  </Button>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LoadingScreen;
