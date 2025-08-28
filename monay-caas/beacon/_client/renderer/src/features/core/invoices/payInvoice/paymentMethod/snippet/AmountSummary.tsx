import { BsCalendarPlus } from "react-icons/bs";

import toggleSwitchOff from "#client/assets/payInvoice/toggleSwitchOff.png";
import { Button } from "#client/components/atoms";
import { useApp } from "#client/features/auth/views/AuthLayout";

interface AmountSummaryProps {
  // amount?: number;
  methodFee?: number;
  upiInput?: string;
  disabled?: boolean;
  submit: () => void;
}

const AmountSummary: React.FC<AmountSummaryProps> = ({
  upiInput,
  // amount = 122.99,
  methodFee = 0.2,
  disabled,
  submit,
}) => {
  const { selectedBills } = useApp()!;
  const amount = selectedBills.reduce((acc, bill) => (acc += bill.amount), 0);
  const handleButtonClick = () => {
    submit();
  };
  return (
    <div>
      <div className="mt-[30px]">
        <p className="text-[16px] font-[700] text-[#36597D]">Summary</p>
        <div className="mt-[10px] flex justify-between">
          <p className="text-[16px] font-[400] text-[#36597D]">
            Payment amount
          </p>
          <p className="ml-[auto] text-[16px] font-[600] text-[#36597D]">
            ₹{amount.toFixed(2)}
          </p>
        </div>
        <div className="mb-[10px] mt-[10px] flex justify-between border-b border-[#8B9EB0] border-opacity-20 pb-[20px]">
          <p className="text-[16px] font-[400] text-[#36597D]">
            Payment method fee
          </p>
          <p className="ml-[auto] text-[16px] font-[600] text-[#36597D]">
            ${methodFee.toFixed(2)}
          </p>
        </div>
        <div className="mb-[10px] mt-[10px] flex justify-between border-b border-[#8B9EB0] border-opacity-20 pb-[10px]">
          <p className="text-[16px] font-[400] text-[#36597D]">Total amount</p>
          <p className="ml-[auto] text-[16px] font-[600] text-[#36597D]">
            ₹{(amount + methodFee).toFixed(2)}
          </p>
        </div>
        <div className="my-[30px] flex flex-col items-center justify-center">
          <Button
            onClick={handleButtonClick}
            disabled={disabled}
            className="h-[54px] w-[200px]"
          >
            Pay now ₹{(amount + methodFee).toFixed(2)}
          </Button>
        </div>
      </div>
      <div className="flex justify-between pt-[15px]">
        <div className="flex items-center justify-center">
          <p className="color-[#36597D] text-[14px] font-[600]">Auto pay</p>
          <img
            className="ml-[10px] w-[64px]"
            src={toggleSwitchOff}
            alt="toggleSwitchOff"
          />
        </div>
        <div className="flex items-center justify-center">
          <BsCalendarPlus className="w-[24px]" />
          <p className="color-[#36597D] ml-[10px] text-[14px] font-[600]">
            Add a reminder to my calendar
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmountSummary;
