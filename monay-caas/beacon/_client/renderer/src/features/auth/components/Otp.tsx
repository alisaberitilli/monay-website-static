import { useEffect, useRef, useState } from "react";

import { minTime } from "#helpers";
import { observer } from "mobx-react-lite";

import { Loading } from "#client/components/atoms";
import { useRootStore } from "#client/store/_root";

import { NoauthStageProps } from "../hooks/useNoauth";

const OTP_LENGTH = 6;

const Otp: React.FC<NoauthStageProps> = () => {
  const root = useRootStore();
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>();
  // this is going to get ugly. its honestly just because this is the most efficient implementation. I think.
  const otp1 = useRef<HTMLInputElement>(null);
  const otp2 = useRef<HTMLInputElement>(null);
  const otp3 = useRef<HTMLInputElement>(null);
  const otp4 = useRef<HTMLInputElement>(null);
  const otp5 = useRef<HTMLInputElement>(null);
  const otp6 = useRef<HTMLInputElement>(null);

  const otpRefs: React.RefObject<HTMLInputElement>[] = [
    otp1,
    otp2,
    otp3,
    otp4,
    otp5,
    otp6,
  ];

  const submitOtp = async () => {
    setLoading(true);
    setOtpError(undefined);
    const { error } = await minTime(root.auth.confirmOtp(otp.join("")), 2000);

    if (typeof error === "string") setOtpError(error);
    else if (error && typeof error === "object") setOtpError(error.message);
    setLoading(false);
  };

  const onInput = (event: React.FormEvent<HTMLInputElement>) => {
    const index = event.currentTarget.tabIndex;
    if (event.currentTarget.value && otpRefs[index + 1]) {
      otpRefs[index + 1].current?.focus();
    } else if (!event.currentTarget.value && otpRefs[index - 1]) {
      otpRefs[index - 1].current?.focus();
    }
    // FIXME: if anyone cares. I know this is awful (READ MORE BELOW)
    setOtp(
      [...otp].map((o, i) => (i === index ? event.currentTarget.value : o))
    );
  };

  // process backspaces in this input array as a "delete entire form" event
  const onPotentialDelete = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key.toLowerCase() === "backspace" ||
      event.key.toLowerCase() === "delete"
    ) {
      // FIXME: yes, this is even more awful. Doing an auto-reset calling `new Array(OTP_LENGTH)` feels a little leaky however: `map`ping over otp allows us to ensure that we never have to think about the otp length besides The Very First Time we mount this component
      setOtp([...otp].map(() => ""));
      if (otpError) setOtpError(undefined);
      otp1.current?.focus();
    }
  };

  // autoFocus earliest empty input
  const onInputFocus = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    const index = event.currentTarget.tabIndex;
    // adding some weird catchall on this loop break just in case. who knows what can happen here
    for (let i = 0; i <= index && i <= otpRefs.length; i++) {
      if (otpRefs[i].current && !otpRefs[i].current?.value) {
        otpRefs[i].current?.focus();
        break;
      }
    }
  };

  useEffect(() => {
    if (otp?.every((o) => o.match(/\d{1}/gi))) {
      submitOtp();
    }
  }, [otp]);

  useEffect(() => {
    const pasteListener = (event: ClipboardEvent) => {
      if (event.isTrusted && event.clipboardData?.getData("text")) {
        const otpText = event.clipboardData?.getData("text");
        if (!otpText.match(/\d{6}/gi)) {
          // FIXME: make this better and also alert to potential security threat in case users are pasting in values from untrusted sources
          alert("Pasted OTP does not match format.");
        } else {
          setOtp(otpText.split(""));
        }
      }
    };
    window.addEventListener("paste", pasteListener);
    return () => {
      window.removeEventListener("paste", pasteListener);
    };
  }, []);

  return (
    <div className="mb-4 mt-8">
      <h1 className="mb-2 text-center">Enter OTP</h1>
      <p className="mb-4 text-center leading-none">
        You should receive an email at {root.auth.email} with a one-time
        passcode from hello@monay.com.
      </p>
      <div className={"relative flex w-full flex-row justify-between"}>
        {otp.map((otpAtIndex, i) => (
          <input
            key={`otp-${i}`}
            maxLength={1}
            className="w-12 rounded-lg border-none bg-zinc-400/10 px-2 py-3 text-center font-mono text-3xl font-bold shadow-inner shadow-zinc-600/30 outline-none transition-all duration-300 focus:ring-2 focus:ring-inset focus:ring-base/25 disabled:bg-zinc-400/0 disabled:shadow-none disabled:ring-2 disabled:ring-zinc-400/10 dark:bg-zinc-50/10 dark:shadow-zinc-900/90 disabled:dark:bg-zinc-50/0 disabled:dark:ring-zinc-50/10 md:w-10"
            value={otpAtIndex}
            ref={otpRefs[i]}
            tabIndex={i}
            onInput={onInput}
            onFocus={onInputFocus}
            onKeyDown={onPotentialDelete}
            disabled={loading}
            autoFocus={i === 0}
          />
        ))}
      </div>
      <div className="mb-2 mt-1 text-center text-xs leading-none">
        Enter OTP Code
      </div>
      {!!otpError && (
        <div className="my-4 rounded-md bg-red-500/20 p-2 text-center font-mono text-xs font-bold backdrop-blur-sm">
          {otpError}
        </div>
      )}
      {loading && (
        <div className="mt-8 flex w-full items-center justify-center">
          <Loading size={32} />
        </div>
      )}
    </div>
  );
};

export default observer(Otp);
