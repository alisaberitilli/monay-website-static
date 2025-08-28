import { createContext, useContext } from "react";

import LoaderModel from "../observables/loader";

export const GlobalLoadingContext = createContext<LoaderModel>(
  new LoaderModel({})
);
export const GlobalLoadingProvider = GlobalLoadingContext.Provider;
const useGlobalLoading = () => useContext(GlobalLoadingContext);

export default useGlobalLoading;
