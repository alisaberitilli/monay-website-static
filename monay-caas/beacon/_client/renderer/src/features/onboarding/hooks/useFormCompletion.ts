import { useRef } from "react";

import { reduceStringLength } from "#helpers";

import { useFormKeyListener } from "#client/hooks";

const useFormCompletion = <T extends Record<string, string>>(
  getFormValues: () => T,
  changeCompletion: (completion: number) => void,
  deltaScalar = 0.1
) => {
  const currentLength = useRef<number>(reduceStringLength(getFormValues()));
  const handler = (values: T) => {
    const newLength = reduceStringLength(values);
    const delta = newLength - currentLength.current;
    if (delta) changeCompletion(delta * deltaScalar);
    currentLength.current = newLength;
  };
  useFormKeyListener(getFormValues, handler);
};

export default useFormCompletion;
