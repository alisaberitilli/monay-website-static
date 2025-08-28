import { TextInput } from "#client/components/form";

const UpiPayment = ({ upiInput, handleUpi }) => {
  return (
    <div className="mt-[20px]">
      <div>
        <p className="pt-[10px] text-[14px] font-[600] text-[#8B9EB0]">
          Enter UPI ID
        </p>
        <div className="pt-[5px]">
          <TextInput value={upiInput} onChange={handleUpi} />
        </div>
      </div>
    </div>
  );
};

export default UpiPayment;
