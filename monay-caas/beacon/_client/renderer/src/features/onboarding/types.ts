import { StageProps } from "#client/utils/types";

export type OnboardingActionType =
  | "ORGNONE"
  | "USERINFO"
  | "ORGINFO"
  | "ORGFINAL";
export type OnboardingStageProps = StageProps<OnboardingActionType> & {
  changeCompletion: (completion: number) => void;
};

export const minCompletionMap: Record<OnboardingActionType, number> = {
  ORGNONE: 0,
  USERINFO: 0,
  ORGINFO: 0.2,
  ORGFINAL: 0.7,
};

export const order: OnboardingActionType[] = [
  "ORGNONE",
  "USERINFO",
  "ORGINFO",
  "ORGFINAL",
];

export const maxPendingMap: Record<OnboardingActionType, number> =
  Object.fromEntries(
    order.map((action, i, o) => [action, minCompletionMap[o[i + 1]] ?? 1])
  ) as Record<OnboardingActionType, number>;

type OnboardingStageMeta = {
  title: string | ((data: Record<string, unknown>) => string);
};
export const stageMetaMap: Record<OnboardingActionType, OnboardingStageMeta> = {
  ORGNONE: {
    title: "",
  },
  USERINFO: {
    title: "Your Info",
  },
  ORGINFO: {
    title: ({ organization }) =>
      organization
        ? `${
            ((organization as string)?.length ?? 0) > 20
              ? (organization as string).slice(0, 17) + "..."
              : organization
          }`
        : "Your Org",
  },
  ORGFINAL: {
    title: "Org Info",
  },
};
