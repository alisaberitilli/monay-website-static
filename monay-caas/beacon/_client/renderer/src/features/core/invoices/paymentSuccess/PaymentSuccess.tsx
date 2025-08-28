import paymentSucess from "#client/assets/payInvoice/paymentSucess.png";
import { Container } from "#client/components/atoms";

type Props = {};

const PaymentSuccess = (props: Props) => {
  return (
    <Container className="w-[653px] pb-[171px] pl-[93px] pr-[96px] pt-[111px]">
      <div className="flex items-center justify-center">
        <img
          className="h-[142px] w-[142px]"
          src={paymentSucess}
          alt="paymentSucess"
        />
      </div>
      <div className="mt-[30px] flex flex-col items-center justify-center">
        <p className="text-[30px] font-[600] text-[#36597D]">
          Payment successful !
        </p>
        <p className="text-[16px] font-[400] text-[#36597D]">
          Thank you, your payment was processed successful.
        </p>
      </div>
      <div className="mt-[30px]">
        <div className="flex justify-between pb-[10px]">
          <p className="text-[16px] font-[400] text-[#36597D]">
            Transaction ID
          </p>
          <p className="ml-[auto] text-[16px] font-[600] text-[#36597D]">
            87654333
          </p>
        </div>
        <div className="flex justify-between pb-[10px]">
          <p className="text-[16px] font-[400] text-[#36597D]">
            Date of transaction
          </p>
          <p className="ml-[auto] text-[16px] font-[600] text-[#36597D]">
            11/07/2023
          </p>
        </div>
        <div
          className="flex justify-between pb-[15px]"
          style={{ borderBottom: "1px solid rgba(139, 158, 176, 0.20)" }}
        >
          <p className="text-[16px] font-[400] text-[#36597D]">Payment Type</p>
          <p className="ml-[auto] text-[16px] font-[600] text-[#36597D]">
            Card 4321
          </p>
        </div>
      </div>
      <div className="mt-[30px]">
        <div className="flex justify-between pb-[10px]">
          <p className="text-[16px] font-[400] text-[#36597D]">
            Payment amount
          </p>
          <p className="ml-[auto] text-[16px] font-[600] text-[#36597D]">
            $122.99
          </p>
        </div>
        <div
          className="mb-[15px] flex justify-between pb-[15px]"
          style={{ borderBottom: "1px solid rgba(139, 158, 176, 0.20)" }}
        >
          <p className="text-[16px] font-[400] text-[#36597D]">
            Payment method fee
          </p>
          <p className="ml-[auto] text-[16px] font-[600] text-[#36597D]">
            $0.00
          </p>
        </div>
        <div
          className="flex justify-between pb-[15px]"
          style={{ borderBottom: "1px solid rgba(139, 158, 176, 0.20)" }}
        >
          <p className="text-[16px] font-[400] text-[#36597D]">Total amount</p>
          <p className="ml-[auto] text-[16px] font-[600] text-[#36597D]">
            $122.99
          </p>
        </div>
      </div>
    </Container>
  );
};

export default PaymentSuccess;
