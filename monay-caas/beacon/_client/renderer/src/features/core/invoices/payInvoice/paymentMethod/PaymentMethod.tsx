import React, { Fragment, useState } from "react";

import { sleep } from "#helpers";
import { RadioGroup, Tab } from "@headlessui/react";
import { BsCreditCard } from "react-icons/bs";
import { BsBank } from "react-icons/bs";

import upiLogo from "#client/assets/payInvoice/upiLogo.png";
import { Button, Container } from "#client/components/atoms";
import { TextInput } from "#client/components/form";

import AddCard from "./snippet/AddCard";
import AddPayee from "./snippet/AddPayee";
import AmountSummary from "./snippet/AmountSummary";
import CardPayment from "./snippet/CardPayment";
import NetBankingPayment from "./snippet/NetBankingPayment";
import UpiPayment from "./snippet/UpiPayment";

const methods: { method: string; img?: string }[] = [
  {
    method: "RTGS",
  },
  {
    method: "NEFT",
  },
  { method: "IMPS" },
  { method: "UPI", img: upiLogo },
];

type Props = {
  submit: () => Promise<void>;
};

const PaymentMethod = (props: Props) => {
  const [upiInput, setUpiInput] = useState("");
  const [selectedPay, setSelectedPay] = useState<
    "upi" | "rtfs" | "neft" | "imps"
  >();

  const handleUpi = (e) => {
    setUpiInput(e.target.value);
  };
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const inactiveStyle = {
    boxShadow:
      "-2px -2px 2px 0px #B8CCE0, -1px -1px 0px 0px #FFF, -2px -2px 2px 0px #B8CCE0 inset, -1px -1px 0px 0px #FFF inset",
  };
  const activeStyle = {
    boxShadow: "-8px -8px 16px 0px #FFF, 8px 8px 16px 0px #C9D9E8",
  };

  return (
    <div className="h-[767px] w-[690px]">
      <Container className="w-[630px]">
        <div className="color-[#36597D] mb-[20px] text-[20px] font-[700]">
          Payment Method
        </div>
        <RadioGroup
          value={selectedPay}
          onChange={setSelectedPay}
          className="flex gap-4"
        >
          <RadioGroup.Label className="sr-only">
            Choose Payment Type
          </RadioGroup.Label>
          {methods.map(({ method, img }) => (
            <RadioGroup.Option key={method} value={method} as={Fragment}>
              {({ active, checked }) => (
                <div
                  className={`"box-border flex h-[44px] cursor-pointer items-center justify-center rounded-[20px] bg-[#F1F5FC] px-[20px] py-[10px] ${
                    checked &&
                    "border-[3px] border-blue-500 font-semibold text-blue-500"
                  }`}
                  style={checked ? activeStyle : inactiveStyle}
                >
                  {img ? <img src={img} alt="upi" /> : method}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </RadioGroup>

        {/* <CardPayment /> */}
        {/* <AddCard /> */}
        {/* <NetBankingPayment /> */}
        {/* <AddPayee /> */}
        {selectedPay === "upi" && (
          <UpiPayment upiInput={upiInput} handleUpi={handleUpi} />
        )}
        <AmountSummary
          upiInput={upiInput}
          disabled={
            !selectedPay || (selectedPay === "upi" && upiInput.length <= 3)
          }
          submit={props.submit}
        />
      </Container>
    </div>
  );
};

export default PaymentMethod;
