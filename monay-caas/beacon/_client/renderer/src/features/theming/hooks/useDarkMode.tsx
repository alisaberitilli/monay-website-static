import { createContext, useContext, useEffect, useState } from "react";

import { getInitialTheme, observeDomTheme } from "../dom";
import { Theme } from "../types";

const ThemeContext = createContext<{ theme: Theme }>({
  theme: getInitialTheme(),
});
const ThemeContextProvider = ThemeContext.Provider;

// TODO: determine if this even needs to be context and instead should all be inlined in the dark mode toggle component because this currently causes an entire app rerender despite not really being needed
export const ThemeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    observeDomTheme(setTheme);
    // return () => disconnect();
  }, []);

  return (
    <ThemeContextProvider value={{ theme }}>{children}</ThemeContextProvider>
  );
};

export const useDarkMode = () => useContext(ThemeContext);
