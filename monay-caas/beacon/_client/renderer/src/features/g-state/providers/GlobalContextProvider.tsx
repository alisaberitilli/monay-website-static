import { useState } from "react";

import { observer } from "mobx-react-lite";

import { LoadingScreen } from "#client/components/singletons";
import { useRootStore } from "#client/store/_root";

import { GlobalErrorProvider } from "./useGlobalError";
import { GlobalLoadingProvider } from "./useGlobalLoading";

const GlobalContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const root = useRootStore();
  const [globalError, setGlobalError] = useState<React.ReactNode>(null);
  const globalLoader = root.global.loader;

  const { loading, meta, canCancel, deactivateLoadingState } = globalLoader;

  return (
    <GlobalErrorProvider value={{ globalError, setGlobalError }}>
      <GlobalLoadingProvider value={globalLoader}>
        <LoadingScreen
          show={loading}
          loadingMeta={meta}
          cancellable={canCancel}
          close={deactivateLoadingState}
        />
        {children}
      </GlobalLoadingProvider>
    </GlobalErrorProvider>
  );
};

export default observer(GlobalContextProvider);
