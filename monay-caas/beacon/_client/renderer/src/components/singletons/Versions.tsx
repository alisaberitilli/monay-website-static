import { useState } from "react";

import { IoLogoChrome, IoLogoElectron, IoLogoNodejs } from "react-icons/io5";
import { IconType } from "react-icons/lib";
import { TbEngine } from "react-icons/tb";

const versionValues: {
  prop: string;
  display?: string;
  textColor: string;
  Icon: IconType;
}[] = [
  {
    prop: "electron",
    textColor: "text-teal-500",
    Icon: IoLogoElectron,
  },
  {
    prop: "chrome",
    textColor: "text-blue-500",
    display: "Chromium",
    Icon: IoLogoChrome,
  },
  {
    prop: "node",
    textColor: "text-lime-500",
    Icon: IoLogoNodejs,
  },
  {
    prop: "v8",
    textColor: "text-red-500",
    Icon: TbEngine,
  },
];

function Versions(): JSX.Element {
  const [versions] = useState(window.electron.process.versions);

  return (
    <ul className="versions text-right font-mono text-xs">
      {versionValues.map(({ prop, textColor, display, Icon }) => (
        <li
          key={prop}
          className={`flex flex-row items-center justify-between gap-3 ${textColor}`}
        >
          <span className="flex flex-row items-center gap-1">
            <Icon />
            {display ??
              prop.toLocaleUpperCase("en-us").slice(0, 1) + prop.slice(1)}
          </span>
          <span className="max-w-[100px] text-[10px] font-bold">
            v{versions[prop]}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default Versions;
