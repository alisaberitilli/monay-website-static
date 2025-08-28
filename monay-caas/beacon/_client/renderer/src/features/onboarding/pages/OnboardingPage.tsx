import { useEffect, useRef, useState } from "react";

import { mapObject, minTime } from "#helpers";
import { Transition } from "@headlessui/react";
import { useSession } from "@supabase/auth-helpers-react";
import { observer } from "mobx-react-lite";

import api from "#client/api";
import { Fade } from "#client/components/animations";
import { useNoauth } from "#client/features/auth";
import { useGlobalLoading } from "#client/features/g-state";
import kvStore, { EPHEMERAL_KEYS } from "#client/store/_kv";

import NoOrg from "../components/NoOrg";
import NoOrgTransition from "../components/NoOrgTransition";
import OnboardingNav from "../components/OnboardingNav";
import OnboardingProgress from "../components/OnboardingProgress";
import OrgFinal from "../components/OrgFinal";
import OrgInformation from "../components/OrgInformation";
import UserInformation from "../components/UserInformation";
import {
  OnboardingActionType,
  maxPendingMap,
  minCompletionMap,
  order,
} from "../types";

const stageMap = {
  ORGNONE: NoOrg,
  USERINFO: UserInformation,
  ORGINFO: OrgInformation,
  ORGFINAL: OrgFinal,
} as const;

const OnboardingPage: React.FC = observer(() => {
  const orgSearchFired = useRef(false);
  const { loading, setGlobalLoading } = useGlobalLoading();
  const { email, organization, submitOnboarding } = useNoauth();
  const session = useSession();
  const org = organization ?? session?.user.user_metadata.organization;
  const [complete, setComplete] = useState<OnboardingActionType>(
    (org
      ? kvStore.get(EPHEMERAL_KEYS.ONBOARDING) ?? "USERINFO"
      : "ORGNONE") as OnboardingActionType
  );
  const [stage, setStage] = useState<OnboardingActionType>(complete);

  const [pctComplete, setPctComplete] = useState<number>(
    minCompletionMap[complete] ?? 0
  );

  useEffect(() => {
    if (!org && session?.user && email && !orgSearchFired.current) {
      setGlobalLoading({
        loading: true,
        meta: "Finding your organization...",
      });
      orgSearchFired.current = true;

      minTime(
        api.user.checkOrgExists
          .query(email as string)
          .then(async (orgId) => {
            if (!orgId) {
              setStage("ORGNONE");
            } else {
              submitOnboarding(orgId);
            }
          })
          .catch(() => {
            // MIGHT BE A FOOTGUN
            orgSearchFired.current = false;
          })
          .finally(() => {
            setGlobalLoading({ loading: false });
          }),
        3000
      );
    } else if (org) {
      setGlobalLoading({ loading: false });
    }
  }, [session, email]);

  useEffect(() => {
    if (order.indexOf(stage) > order.indexOf(complete)) {
      setComplete(stage);
      kvStore.set(EPHEMERAL_KEYS.ONBOARDING, stage.toString());
    }
  }, [stage]);

  const goToStage = (stage: OnboardingActionType) => {
    setStage(stage);
  };

  const changeCompletion = (completion: number) => {
    const onPreviousStage = order.indexOf(stage) < order.indexOf(complete);
    setPctComplete((pctComplete) => {
      // if existing completion is >= maxPendingMap[stage], and were on some previous stage, do nothing. we don't "remove" completion from completed stages
      if (pctComplete + completion > maxPendingMap[stage] && onPreviousStage) {
        return pctComplete;
      }

      // total completion cant be below the min completion for a given stage otherwise
      return Math.max(
        Math.min(completion + pctComplete, maxPendingMap[stage]),
        0
      );
    });
  };

  const map = mapObject(stageMap, (_, fc) => ({
    props: { goToStage, changeCompletion, finish: submitOnboarding },
    el: fc,
  }));

  return (
    <div className="flex h-full w-full flex-col-reverse overflow-hidden md:flex-row-reverse">
      <div className="w-full md:w-[422px] lg:w-[618px]">
        <div className="flex h-full w-full flex-col items-start justify-center overflow-hidden bg-black/10 px-2 shadow-md shadow-black/30 md:items-center md:px-6">
          <Fade
            delay
            appear
            block
            map={map}
            focusedIndex={stage}
            className="flex flex-1 flex-col items-center justify-center"
          />
          <OnboardingNav
            loading={loading}
            setStage={setStage}
            stage={stage}
            complete={complete}
          />
        </div>
      </div>
      <div className="relative h-auto flex-1 md:flex-grow">
        <div className="hidden h-full w-full items-center justify-center md:flex">
          <Transition
            as={"div"}
            className="h-full w-full"
            show={!loading && stage !== "ORGNONE"}
            enter="duration-300 ease-in delay-300"
            enterFrom="scale-75 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="duration-500 ease-out"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-50 opacity-0"
            autoFocus={false}
          >
            <OnboardingProgress
              stage={stage}
              complete={pctComplete}
              clamp={maxPendingMap[complete] ?? 0}
              pending={maxPendingMap[complete] ?? 0}
            />
          </Transition>
          <NoOrgTransition show={!loading && stage === "ORGNONE"} />
        </div>
      </div>
    </div>
  );
});

export default OnboardingPage;
