import { degreesToRadians, polarToCartesian } from "#constants";

import { OnboardingActionType } from "../types";

const filled: number[] = [];
const randomFill = (length: number, preset?: number): number => {
  const randomNum = preset ?? Math.floor(Math.random() * length);
  if (~filled.indexOf(randomNum)) {
    return randomFill(length);
  } else {
    filled.push(randomNum);
  }
  return randomNum;
};

const TOTAL = 600;
const FILTERED = 100;
// archimedes spiral can be represented by formulat r = k*theta (k is some constant, but we can use the )
// we can use this to build transforms
// lets try and keep the total number of elements relatively low however
const positions = new Array(TOTAL + FILTERED)
  .fill(2.8)
  .map((k, i, arr) => ({
    ...polarToCartesian({
      r:
        degreesToRadians(i * 8 * k) +
        degreesToRadians((8 * (TOTAL - i + 100)) / TOTAL),
      theta:
        degreesToRadians(i * 10 - (k * i) / TOTAL) +
        degreesToRadians((400 * (TOTAL - i)) / TOTAL),
    }),
  }))
  .filter((_, i) => (i < FILTERED * 2 ? i % 2 : true))
  .map((obj, i) => ({
    ...obj,
    fillOrder: randomFill(
      TOTAL,
      i < FILTERED / 2 ? (i % 6 ? undefined : i) : undefined
    ),
  }));

interface OnboardingProgressProps extends ProgressProps {
  stage: OnboardingActionType;
}
const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  clamp = 1,
  complete = 0,
  pending = 0,
  total = 1,
  stage,
}) => {
  const pctComplete = complete / total;
  const pctPending = Math.max(pending / total, pctComplete);
  const pctClamp = clamp / total;

  return (
    <div className="relative h-full overflow-hidden">
      <div className="rotate-cw absolute right-1/2 top-1/2 transform-gpu will-change-transform [animation-duration:90s]">
        <>
          {positions.map(({ x, y, fillOrder }, i) => {
            const pct = fillOrder / TOTAL;
            let bg = "bg-zinc-600 shadow-sm shadow-zinc-800";
            if (pct <= pctComplete && pct <= pctClamp) {
              bg = "bg-green-600 shadow-inner shadow-green-900/70";
            } else if (pct <= pctPending && pct <= pctClamp) {
              bg = "bg-zinc-700 ring ring-inset ring-slate-700";
            }
            return (
              <ProgressMember key={`${x}-${y}`} x={x} y={y} bg={bg} index={i} />
            );
          })}
        </>
      </div>
    </div>
  );
};

const ProgressMember: React.FC<{
  x: number;
  y: number;
  bg: string;
  index: number;
}> = ({ x, y, bg, index }) => {
  const size = 8;
  return (
    <div
      className={`absolute rounded-full ${bg} transition-all duration-500`}
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
        height: size,
        width: size,
      }}
    >
      <div className="flex transform-gpu items-center justify-center text-[8px] will-change-auto"></div>
    </div>
  );
};

export default OnboardingProgress;
