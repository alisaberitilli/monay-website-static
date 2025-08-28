import React, { useEffect, useState } from "react";

import { mapObject } from "#helpers";
import { observer } from "mobx-react-lite";
import { RiArrowLeftDoubleFill } from "react-icons/ri";

import { Fade } from "#client/components/animations";
import { Container } from "#client/components/atoms";
import { EPHEMERAL_KEYS, getEphData } from "#client/store/_kv";
import { noop } from "#constants";

import "../../../assets/splash.css";
import { Otp, SignIn, SignUp } from "../components";
import type { NoauthActionType, NoauthStageProps } from "../hooks/useNoauth";

const stageMap = {
  OTP: Otp,
  SIGNIN: SignIn,
  SIGNUP: SignUp,
} as const;

const initialStage = getEphData(EPHEMERAL_KEYS.PREV_SESSION)
  ? "SIGNIN"
  : "SIGNUP";

const swapMap = {
  OTP: initialStage,
  SIGNIN: "SIGNUP",
  SIGNUP: "SIGNIN",
} as const;

const SwapSign: React.FC<{
  stage: NoauthActionType;
  swap: () => unknown;
  lock?: boolean;
}> = ({ stage, swap, lock }) => {
  const [_stage, setStage] = useState(stage);

  useEffect(() => {
    // hacky and lame but hey. it works
    const timeout = setTimeout(() => {
      setStage(stage);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [stage]);

  return (
    <button
      tabIndex={-1}
      className="-mb-2 -ml-2 flex cursor-pointer flex-row items-center justify-start py-4 pl-2 pr-4"
      onClick={lock ? noop : swap}
    >
      <RiArrowLeftDoubleFill size={14} />
      or{" "}
      <span className="ml-1 font-bold">
        {_stage === "SIGNIN" ? "Sign Up" : "Sign In"}
      </span>
    </button>
  );
};

const SplashPage: React.FC = () => {
  const [stage, setStage] = useState<NoauthActionType>(initialStage);
  const [lock, setLock] = useState<boolean>(false);

  const stageProps: NoauthStageProps = {
    goToOtp: () => setStage("OTP"),
    goToSignup: () => setStage("SIGNUP"),
    goToSignin: () => setStage("SIGNIN"),
  };

  const map = mapObject(stageMap, (_, Fc) => ({ props: stageProps, el: Fc }));
  const swap = () => {
    setStage(swapMap[stage]);
    setLock(true);
  };

  const resetLock = () => {
    if (lock) setLock(false);
  };

  return (
    <div className="relative flex h-screen w-screen flex-row items-center justify-center overflow-hidden">
      <div className="absolute -z-10 flex h-screen w-screen items-center justify-center">
        <div className="grid h-full max-h-[56rem] w-full max-w-4xl grid-cols-12 grid-rows-[repeat(12,minmax(0,1fr));]"></div>
      </div>
      <div className="mx-4 w-full md:w-[416px]">
        {stage !== "OTP" && (
          <Fade focusedIndex={stage} noIndex translation="bottom">
            <SwapSign stage={stage} swap={swap} lock={lock} />
          </Fade>
        )}
        <Container padding="lg">
          <Fade map={map} onSwap={resetLock} focusedIndex={stage} />
        </Container>
      </div>
    </div>
  );
};

export default observer(SplashPage);
