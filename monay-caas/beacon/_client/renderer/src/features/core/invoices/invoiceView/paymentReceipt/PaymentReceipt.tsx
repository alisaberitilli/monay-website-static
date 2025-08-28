import PeopleGas from "#client/assets/payInvoice/Peoplegas.png";
import { Button, Container } from "#client/components/atoms";

interface PaymentReceiptProps {
  invoiceNumber: number;
  projectName: string;
  department: string;
  date: any;
  dueDate: any;
  category: string;
  status: string;
  description: string;
  paymentAmount: any;
  netAmount: any;
  unitPrice: any;
  quantity: number;
  paymentMethodFee: any;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  invoiceNumber,
  projectName,
  department,
  date,
  dueDate,
  category,
  status,
  description,
  paymentAmount,
  netAmount,
  unitPrice,
  quantity,
  paymentMethodFee,
  ...props
}) => {
  return (
    <div className="">
      <Container className="p-[30px]">
        <div className="flex justify-between pb-[20px]">
          <div
            className="flex items-center w-auto"
          >
            <img className="w-[50px]" src={PeopleGas} alt="" />
            <p className="text-[18px] font-[600] text-[#36597D]">Pepco</p>
          </div>
          <div className="flex justify-between w-[35%]">
            <Button intent="secondary" className="h-[50px] w-[92px]">
              Preview
            </Button>
            <Button intent="secondary" className="h-[50px] w-[89px]">
              Dispute
            </Button>
            <Button intent="primary" className="h-[50px]">
              Submit for approval
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-[50%_50%] text-[#36597D] ">
          <div className="text-[16px] font-semibold mt-[10px]">Invoice number</div>
          <div className="flex justify-end text-[14px] font-medium mt-[10px]">{invoiceNumber}</div>
          <div className="text-[16px] font-semibold mt-[10px]">Project name</div>
          <div className="flex justify-end text-[14px] font-medium mt-[10px]">{projectName}</div>
          <div className="text-[16px] font-semibold mt-[10px]">Department</div>
          <div className="flex justify-end text-[14px] font-medium mt-[10px]">{department}</div>
          <div className="text-[16px] font-semibold mt-[10px]">Date</div>
          <div className="flex justify-end text-[14px] font-medium mt-[10px]">{date}</div>
          <div className="text-[16px] font-semibold mt-[10px]">Due date</div>
          <div className="flex justify-end text-[14px] font-medium mt-[10px]">{dueDate}</div>
          <div className="text-[16px] font-semibold mt-[10px]">Category</div>
          <div className="flex justify-end text-[14px] font-medium mt-[10px]">{category}</div>
          <div className="text-[16px] font-semibold mt-[10px]">Status</div>
          <div className="flex justify-end mt-[10px] h-[30px] items-center rounded-[5px]">
            <span className="text-[#F00] text-[14px] font-semibold py-[5px] px-[10px] bg-red-500 bg-opacity-5">{status}</span>
          </div>
        </div>
        <div className="mt-[10px] text-[#36597D] ">
          <div className="text-[16px] font-semibold mt-[10px]">Description</div>
          <div className="mt-[10px] text-[16px] font-medium">{description}</div>
        </div>
        <div className="mt-[20px]">
          <p className="text-[16px] font-bold text-[#36597D]">Summary</p>
          <div className="grid grid-cols-[50%_50%] text-[#36597D] ">
            <div className="text-[16px] font-normal mt-[10px]">Payment amount</div>
            <div className="flex justify-end text-[16px] font-semibold mt-[10px]">${parseFloat(paymentAmount)}</div>
            <div className="text-[16px] font-normal mt-[10px]">Net amount</div>
            <div className="flex justify-end text-[16px] font-semibold mt-[10px]">${parseFloat(netAmount)}</div>
            <div className="text-[16px] font-normal mt-[10px]">Unit price</div>
            <div className="flex justify-end text-[16px] font-semibold mt-[10px]">${parseFloat(unitPrice)}</div>
            <div className="text-[16px] font-normal mt-[10px]">Quantity</div>
            <div className="flex justify-end text-[16px] font-semibold mt-[10px]">{quantity}</div>
            <div className="text-[16px] font-normal mt-[10px] mb-[15px]">Payment method fee</div>
            <div className="flex justify-end text-[16px] font-semibold mt-[10px] mb-[15px]">${parseFloat(paymentMethodFee)}</div>
          </div>
          <div className="flex justify-between text-[#36597D] pb-[15px]" style={{borderTop: "1px solid rgba(139, 158, 176, 0.20)", borderBottom: "1px solid rgba(139, 158, 176, 0.20)"}}>            
            <div className="text-[16px] font-normal mt-[10px]">Total amount</div>
            <div className="text-[16px] font-semibold mt-[10px]">$122.99</div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PaymentReceipt;
