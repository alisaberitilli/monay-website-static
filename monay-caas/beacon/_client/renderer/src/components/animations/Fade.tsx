import { Children, useEffect, useId, useRef, useState } from "react";

import { addDefaultClasses } from "#helpers";
import { Transition } from "@headlessui/react";

type Translation = "none" | "top" | "bottom" | "left" | "right";
type TransitionPropKeys =
  | "enter"
  | "enterFrom"
  | "enterTo"
  | "leave"
  | "leaveFrom"
  | "leaveTo";
type TransitionProps = Record<TransitionPropKeys, string>;

const defaultTransitionProps: TransitionProps = {
  enter: "ease-out",
  enterFrom: "opacity-0",
  enterTo: "opacity-1",
  leave: "ease-in",
  leaveFrom: "opacity-1",
  leaveTo: "opacity-0",
};
const fadeTranslationMap: Record<
  Translation,
  Partial<TransitionProps>
> = addDefaultClasses(
  {
    none: { ...defaultTransitionProps },
    top: {
      enter: "translate-y-0",
      enterFrom: "-translate-y-8",
      enterTo: "translate-y-0",
      leave: "-translate-y-8",
      leaveFrom: "translate-y-0",
      leaveTo: "-translate-y-8",
    },
    bottom: {
      enter: "translate-y-0",
      enterFrom: "translate-y-8",
      enterTo: "translate-y-0",
      leave: "translate-y-8",
      leaveFrom: "translate-y-0",
      leaveTo: "translate-y-8",
    },
    left: {
      enter: "translate-x-0",
      enterFrom: "-translate-x-8",
      enterTo: "translate-x-0",
      leave: "-translate-x-8",
      leaveFrom: "translate-x-0",
      leaveTo: "-translate-x-8",
    },
    right: {
      enter: "translate-x-0",
      enterFrom: "translate-x-8",
      enterTo: "translate-x-0",
      leave: "-translate-x-8",
      leaveFrom: "translate-x-0",
      leaveTo: "translate-x-8",
    },
  },
  defaultTransitionProps
);

// TODO: figure out how to make this work!
// const measureChildHeight = (element) => {
//   const container = document.getElementById("measure");
//   if (container) {
//     document.body.appendChild(container);
//     console.log(element);

//     const portal = ReactDOM.createPortal(element, container);

//     const height = container.clientHeight;
//     const width = container.clientWidth;

//     ReactDOM.unmountComponentAtNode(container);
//     container.parentNode?.removeChild(container);

//     return height;
//   }
//   return 0;
// };

interface FadeProps extends Partial<TransitionProps> {
  focusedIndex?: number | string;
  // eslint-disable-next-line
  map?: Record<string, { props: {}; el: React.FC<any> }>;
  translation?: Translation;
  translationProps?: TransitionProps;
  onSwap?: (index: number | string) => unknown;
  noIndex?: boolean;
  block?: boolean;
  appear?: boolean;
  delay?: boolean;
  className?: string;
}
const Fade: React.FC<React.PropsWithChildren<FadeProps>> = ({
  children,
  map,
  focusedIndex = 0,
  translation = "none",
  translationProps = {},
  onSwap,
  noIndex = false,
  block = false,
  appear = false,
  delay = false,
  className = "",
  ...props
}) => {
  const id = useId();
  const [show, setShow] = useState<boolean>(!appear);
  const nextChildIndex = useRef(focusedIndex);
  const [_focusedIndex, setFocusedIndex] = useState(focusedIndex);

  const renderFocusedChild = (): React.ReactNode => {
    if (import.meta.env.DEV && children && map) {
      console.warn("Both children and map found in Fade with id:", id);
      console.warn(
        "When this happens the Fade API will ignore React Children and instead use the `map` prop values instead."
      );
    }

    if (noIndex) {
      return children;
    }

    if (map && _focusedIndex in map) {
      const el = map[_focusedIndex];
      const Component = el.el;
      return <Component {...el.props} />;
    }

    if (children) {
      return Children.toArray(children)[_focusedIndex];
    }

    return null;
  };

  useEffect(() => {
    if (focusedIndex !== nextChildIndex.current) {
      nextChildIndex.current = focusedIndex;
      setShow(false);
    }
  }, [focusedIndex]);

  const swapChild = () => {
    if (onSwap) onSwap(nextChildIndex.current);
    setFocusedIndex(nextChildIndex.current);
    setShow(true);
  };

  const fadeTranslation = fadeTranslationMap[translation];
  if (delay) fadeTranslation.enter += " delay-[1s]";

  useEffect(() => {
    if (appear) setShow(true);
  }, []);

  return (
    <>
      <Transition
        // id={id}
        afterLeave={swapChild}
        unmount={false}
        show={show}
        appear={appear}
        as={"div"}
        className={`transition-all duration-500 ${
          block && "w-full"
        } ${className}`}
        {...translationProps}
        {...fadeTranslation}
        {...props}
      >
        {renderFocusedChild()}
      </Transition>
    </>
  );
};

export default Fade;
