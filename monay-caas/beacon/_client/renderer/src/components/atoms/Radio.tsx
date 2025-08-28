import { useState } from "react";

import { RadioGroup as TailRadioGroup } from "@headlessui/react";

import RadioActive from "#client/assets/forms/RadioActive.svg";
import RadioInactive from "#client/assets/forms/RadioInactive.svg";

interface RadioProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  altText: string;
  heightOverride?: number;
  widthOverride?: number;
}

const Radio: React.FC<RadioProps> = () => {
  const [plan, setPlan] = useState("startup");

  return (
    <TailRadioGroup value={plan} onChange={setPlan}>
      <TailRadioGroup.Label>Radio buttons</TailRadioGroup.Label>
      <TailRadioGroup.Option value="startup">
        {({ checked }) => (
          <p
            className={checked ? "bg-blue-200" : ""}
            style={{ display: "flex", flexDirection: "row" }}
          >
            <img src={RadioInactive} alt="radioDisabled" />
            Option
          </p>
        )}
      </TailRadioGroup.Option>
      <TailRadioGroup.Option value="business">
        {({ checked }) => (
          <p
            className={checked ? "bg-blue-200" : ""}
            style={{ display: "flex", flexDirection: "row" }}
          >
            <img
              src={RadioActive}
              alt="radioEnabled"
              style={{
                boxShadow:
                  "4px 4px 20px 0px rgba(111, 140, 176, 0.41), -6px -6px 20px 0px #FFF, 2px 2px 4px 0px rgba(114, 142, 171, 0.10)",
                background:
                  "linear-gradient(227deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.00) 100%), linear-gradient(270deg, #50CAFF 0%, #0478FF 100%)",
                borderRadius: "50%",
                width: "16px",
                height: "16px",
                marginTop: "5px",
              }}
            />
            Selected option
          </p>
        )}
      </TailRadioGroup.Option>
      <TailRadioGroup.Option value="enterprise">
        {({ checked }) => (
          <p
            className={checked ? "bg-blue-200" : ""}
            style={{ display: "flex", flexDirection: "row" }}
          >
            <img src={RadioInactive} alt="radioDisabled" />
            Other option
          </p>
        )}
      </TailRadioGroup.Option>
    </TailRadioGroup>
  );
};

export default Radio;
