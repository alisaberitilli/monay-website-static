import radioDisable from "#client/assets/payInvoice/radioDisable.png";
import { TextInput } from "#client/components/form";

import AmountSummary from "./AmountSummary";

const NetBankingPayment = () => {
  return (
    <div>
      <div className="mb-[15px] ml-[auto] flex justify-end text-[14px] font-[700] text-[#564DCD]">
        add / manage payees
      </div>
      <div>
        <p className="pt-[10px] text-[14px] font-[600] text-[#8B9EB0]">
          Enter payee name
        </p>
        <div className="pt-[5px]">
          <TextInput />
        </div>
      </div>
      <div className="pt-[20px]">
        <p className="text-[14px] font-[600] text-[#8B9EB0]">
          Select transfer mode
        </p>
        <div className="flex pt-[10px] text-[14px] font-[600] text-[#8B9EB0]">
          <div className="mr-[25px] flex">
            <img src={radioDisable} alt="radioDisable" />
            <p className="pl-[5px]">NEFT</p>
          </div>
          <div className="mr-[25px] flex">
            <img src={radioDisable} alt="radioDisable" />
            <p className="pl-[5px]">RTGS</p>
          </div>
          <div className="mr-[25px] flex">
            <img src={radioDisable} alt="radioDisable" />
            <p className="pl-[5px]">IMPS</p>
          </div>
          <div className="flex">
            <img src={radioDisable} alt="radioDisable" />
            <p className="pl-[5px]">MMID</p>
          </div>
        </div>
      </div>
      <div className="pt-[20px]">
        <p className="text-[14px] font-[600] text-[#8B9EB0]">Remarks</p>
        <div className="pt-[5px]">
          <TextInput />
        </div>
      </div>
      <AmountSummary />
    </div>
  );
};

export default NetBankingPayment;
