import { Fragment } from "react";

import { Transition } from "@headlessui/react";

import { Button } from "#client/components/atoms";
import { useNoauth } from "#client/features/auth";

import { type OnboardingActionType, order, stageMetaMap } from "../types";

// orgnone never counts
const items = order.slice(1);

interface OnboardingNavProps {
  loading?: boolean;
  setStage: (stage: OnboardingActionType) => void;
  stage: OnboardingActionType;
  complete: OnboardingActionType;
}
const OnboardingNav: React.FC<OnboardingNavProps> = ({
  loading,
  setStage,
  stage,
  complete,
}) => {
  const { organization } = useNoauth();
  const currentStage = stage;

  return (
    <Transition
      as={Fragment}
      show={!loading && stage !== "ORGNONE"}
      appear
      enter="duration-300 ease-in delay-1000 origin-bottom"
      enterFrom="scale-90 opacity-0"
      enterTo="scale-100 opacity-100"
      leave="duration-500 ease-out origin-top"
      leaveFrom="scale-100 opacity-100"
      leaveTo="scale-50 opacity-0"
    >
      <div className="-mx-2 w-full rounded-t-xl bg-zinc-500/10 md:-mx-6">
        <div className="flex w-full flex-row items-center">
          {items.map((stage) => {
            const { title } = stageMetaMap[stage];

            const display =
              typeof title === "function" ? title({ organization }) : title;

            const onClick = () =>
              stage !== currentStage ? setStage(stage) : null;

            return (
              <Button
                key={stage}
                disabled={order.indexOf(stage) > order.indexOf(complete)}
                intent="bare"
                size="small"
                onClick={onClick}
                className={`flex-1 rounded-b-none px-6 py-4 text-zinc-700 dark:text-zinc-300 ${
                  stage === currentStage &&
                  "border-t-2 border-t-purple-700/40 bg-zinc-300/10 shadow-inner shadow-purple-950/20 dark:border-t-purple-300/40"
                }`}
              >
                <h3 className="text-sm font-bold">{display}</h3>
              </Button>
            );
          })}
        </div>
      </div>
    </Transition>
  );
};

export default OnboardingNav;
