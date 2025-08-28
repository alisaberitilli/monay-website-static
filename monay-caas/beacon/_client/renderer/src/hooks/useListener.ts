import { useEffect } from "react";

const useListener = (type: keyof WindowEventMap, listener: () => void) => {
  useEffect(() => {
    window.addEventListener(type, listener);

    return () => {
      window.removeEventListener(type, listener);
    };
  }, []);
};

export default useListener;
