import { Fragment, useRef, useState } from "react";

import { Dialog, Transition } from "@headlessui/react";

import { Button } from "#client/components/atoms";

import useSession from "../hooks/useSession";

const SignOut: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const session = useSession();
  const signoutButtonRef = useRef<HTMLButtonElement>(null);
  const confirmSignOut = () => setIsOpen(true);
  const cancel = () => setIsOpen(false);

  return (
    <>
      <Button
        onClick={confirmSignOut}
        className="bg-red-700 text-red-50 hover:bg-red-800 hover:text-white"
      >
        Sign Out
      </Button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          initialFocus={signoutButtonRef}
          open={isOpen}
          onClose={cancel}
          className="relative z-50"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              aria-hidden="true"
            />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-300"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-sm rounded-lg bg-base/90 p-6 align-middle text-base shadow-md shadow-base/20 ring-1 ring-inset ring-base transition-all dark:bg-base/10 dark:text-base">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-medium leading-8"
                  >
                    Sign Out
                  </Dialog.Title>
                  <Dialog.Description
                    as="p"
                    className="text-sm text-light/80 dark:text-dark/80"
                  >
                    This will sign you out of Monay Beacon on this device.
                  </Dialog.Description>
                  <p className="mb-2 mt-4">
                    Are you sure you want to sign out?
                  </p>
                  <div className="flex flex-col justify-between sm:flex-row">
                    <Button
                      onClick={session?.signOut}
                      buttonRef={signoutButtonRef}
                      className="mb-4 w-full sm:mb-0 sm:w-auto"
                      disabled={loading}
                    >
                      Yes, sign me out
                    </Button>
                    <Button
                      onClick={cancel}
                      className="w-full sm:w-auto"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                  {!!error && (
                    <div className="mt-2 font-bold text-red-600">
                      Error: {error}
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default SignOut;
