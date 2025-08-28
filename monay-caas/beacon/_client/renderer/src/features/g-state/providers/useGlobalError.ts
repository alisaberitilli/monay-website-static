import React, { createContext, useContext } from "react";

import { noop } from "#constants";

export interface IGlobalErrorContextData {
  globalError?: React.ReactNode;
}
export interface IGlobalErrorContextFunctions {
  setGlobalError: React.Dispatch<React.SetStateAction<React.ReactNode>>;
}
export const GlobalErrorContext = createContext<
  IGlobalErrorContextData & IGlobalErrorContextFunctions
>({
  globalError: null,
  setGlobalError: noop,
});

export const GlobalErrorProvider = GlobalErrorContext.Provider;
const useGlobalError = () => useContext(GlobalErrorContext);
export default useGlobalError;
