import { useState } from "react";

import { observer } from "mobx-react-lite";

import { init } from "./api";
import { Debug } from "./components/singletons";
import { SessionProvider } from "./features/auth";
import { GlobalContextProvider } from "./features/g-state";
import { ThemeProvider } from "./features/theming";
import Router from "./router";
import { RootProvider } from "./store/_root";

const App: React.FC = () => {
  const [root] = useState(() => init());

  return (
    <SessionProvider>
      <RootProvider value={root}>
        <GlobalContextProvider>
          <ThemeProvider>
            <Router />
            <Debug />
          </ThemeProvider>
        </GlobalContextProvider>
      </RootProvider>
    </SessionProvider>
  );
};

export default observer(App);
