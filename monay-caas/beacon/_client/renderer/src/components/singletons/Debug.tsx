import React, { useEffect, useState } from "react";

import { useSession } from "#client/features/auth";
import { ThemeToggle, useDarkMode } from "#client/features/theming";

import Versions from "./Versions";

let Debug: React.FC = () => {
  return null;
};

/* DEBUG.START */
if (import.meta.env.DEV) {
  const DebugAspect: React.FC<
    React.PropsWithChildren<{ title: string; initialShow?: boolean }>
  > = ({ title, initialShow = false, children }) => {
    const [show, setShow] = useState<boolean>(initialShow);

    return (
      <div className="mb-4 w-full text-right">
        <pre className="flex w-full items-end justify-end text-right text-lg leading-none">
          {title}{" "}
          <button
            className="flex items-center justify-center rounded bg-blue-700 px-2 py-1 text-[8px]"
            onClick={() => setShow(!show)}
          >
            {show ? "HIDE" : "SHOW"}
          </button>
        </pre>
        {show && children}
      </div>
    );
  };

  const SessionPanel: React.FC = () => {
    const session = useSession();
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const onCopyToken = () => {
      if (session) {
        navigator.clipboard.writeText(session.access_token);
      }

      if (timer) clearTimeout(timer);
      const timeout = setTimeout(() => {
        setTimer(null);
      }, 5000);
      setTimer(timeout);
    };

    return session ? (
      <>
        <div
          className="cursor-pointer py-2 pl-3 text-right text-xs"
          onClick={onCopyToken}
        >
          {timer ? "Copied!" : "Copy"} <code>access_token</code>
        </div>
        <ul className="text-right text-xs">
          <li>
            Onboarding Complete:{" "}
            <code>
              {session.user.user_metadata.onboarding_complete
                ? "true"
                : "false"}
            </code>
          </li>
          <li>
            Server User Created:{" "}
            <code>
              {session.user.user_metadata.server_user_created
                ? "true"
                : "false"}
            </code>
          </li>
        </ul>
        <button
          className="rounded bg-red-600 px-3 py-1 text-sm"
          onClick={() => session.signOut()}
        >
          Sign Out
        </button>
      </>
    ) : (
      "No current session"
    );
  };

  Debug = function Debug() {
    const [open, setOpen] = useState<boolean>(false);
    const { theme } = useDarkMode();
    useEffect(() => {
      const listener = (event: KeyboardEvent) => {
        if (event.altKey && (event.key === "p" || event.key === "π")) {
          // macos is silly
          event.preventDefault();
          setOpen((o) => !o);
        }
      };
      document.documentElement.addEventListener("keyup", listener);

      return () => {
        document.documentElement.removeEventListener("keyup", listener);
      };
    }, []);

    if (!open) return null;

    return (
      <div className="absolute bottom-8 right-8 z-[9999] rounded-xl bg-zinc-900 p-4 text-zinc-200 ring-4 ring-zinc-500">
        <h4 className="mb-4 text-right text-xl">
          <code>DEBUG MENU</code>
        </h4>
        <div className="flex w-52 flex-row justify-end">
          <div>
            <div className="mb-4 flex flex-row items-baseline justify-between">
              <div className="mr-4 text-sm">
                Theme: <code className="text-xs">{theme}</code>
              </div>
              <ThemeToggle />
            </div>
            <DebugAspect title="Versions">
              <Versions />
            </DebugAspect>
            <DebugAspect title="Session">
              <SessionPanel />
            </DebugAspect>
          </div>
        </div>
      </div>
    );
  };
}
/* DEBUG.END */

export default Debug;
