import useListener from "./useListener";

const useFormKeyListener = <T>(
  getFormValues: () => T,
  handler: (keyValues: T) => unknown
) => {
  useListener("keyup", () => {
    const values = getFormValues();
    handler(values);
  });
};

export default useFormKeyListener;
