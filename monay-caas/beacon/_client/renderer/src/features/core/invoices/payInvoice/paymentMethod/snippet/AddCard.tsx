import { Button } from "#client/components/atoms";
import { TextInput } from "#client/components/form";

const AddCard = () => {
  return (
    <div className="mt-[30px]">
      <p className="text-[16px] font-[700] text-[#36597D]">Add card</p>
      <div>
        <p className="pt-[10px] text-[14px] font-[600] text-[#8B9EB0]">
          Card number*
        </p>
        <div className="pt-[5px]">
          <TextInput base="neu" />
        </div>
      </div>
      <div className="flex">
        <div className="mr-[20px] w-[306px]">
          <p className="pt-[10px] text-[14px] font-[600] text-[#8B9EB0]">
            CVV*
          </p>
          <div className="pt-[5px]">
            <TextInput base="neu" />
          </div>
        </div>
        <div className="w-[306px]">
          <p className="pt-[10px] text-[14px] font-[600] text-[#8B9EB0]">
            Expiration date*
          </p>
          <div className="pt-[5px]">
            <TextInput base="neu" />
          </div>
        </div>
      </div>
      <div>
        <p className="pt-[10px] text-[14px] font-[600] text-[#8B9EB0]">
          Name on card*
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

export default AddCard;
