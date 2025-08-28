import { useEffect, useState } from "react";

const useAppear = (timer = 500) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
    }, timer);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return { show, setShow };
};

export default useAppear;
