import { RiMoonFill, RiSunFill } from "react-icons/ri";

import { Switch } from "#client/components/atoms";

import { toggleDomTheme } from "../dom";
import { useDarkMode } from "../hooks/useDarkMode";

const ThemeToggle: React.FC = () => {
  const { theme } = useDarkMode();
  const isDarkMode = theme === "dark";
  const Icon = isDarkMode ? RiMoonFill : RiSunFill;

  return (
    <Switch
      checked={isDarkMode}
      onChange={toggleDomTheme}
      altText={`${isDarkMode ? "Disable" : "Enable"} dark mode`}
    >
      <Icon size={10} color={isDarkMode ? "white" : "black"} />
    </Switch>
  );
};

export default ThemeToggle;
