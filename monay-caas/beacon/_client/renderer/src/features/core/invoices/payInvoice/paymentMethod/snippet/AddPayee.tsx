import { Button } from "#client/components/atoms";
import { TextInput } from "#client/components/form";

const AddPayee = () => {
  return (
    <div className="mt-[30px]">
      <p className="text-[16px] font-[700] text-[#36597D]">
        Add / Manage payee
      </p>
      <div>
        <p className="pt-[10px] text-[14px] font-[600] text-[#8B9EB0]">
          Enter payee name
        </p>
        <div className="pt-[5px]">
          <TextInput base="neu" />
        </div>
      </div>
      <div>
        <p className="pt-[10px] text-[14px] font-[600] text-[#8B9EB0]">
          Account number
        </p>
        <div className="pt-[5px]">
          <TextInput base="neu" />
        </div>
      </div>
      <div>
        <p className="pt-[10px] text-[14px] font-[600] text-[#8B9EB0]">
          Re-enter account number
        </p>
        <div className="pt-[5px]">
          <TextInput base="neu" />
        </div>
      </div>
      <p className="pt-[5px] text-[14px] font-[400] text-[#8B9EB0]">
        Please ensure that the payee account number that you enter is correct.
      </p>
      <div>
        <p className="pt-[10px] text-[14px] font-[600] text-[#8B9EB0]">
          Email ID
        </p>
        <div className="pt-[5px]">
          <TextInput base="neu" />
        </div>
      </div>
      <div className="flex justify-between pb-[30px] pl-[10px] pr-[10px] pt-[20px]">
        <Button intent="secondary" className="w-[280px]">
          Cancel
        </Button>
        <Button intent="primary" className="w-[280px]">
          Add card
        </Button>
      </div>
    </div>
  );
};

export default AddPayee;
