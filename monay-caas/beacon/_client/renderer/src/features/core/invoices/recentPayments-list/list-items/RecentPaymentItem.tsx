import React from "react";

import { Container } from "#client/components/atoms";

interface RecentPaymentItemProps {
  transactionId?: string;
  provider?: string;
  serviceType?: string;
  paymentDate?: string;
  amount?: number;
  paymentStatus?: string;
}

const RecentPaymentItem: React.FC<RecentPaymentItemProps> = ({
  transactionId = "3245234345",
  provider = "People Gas",
  serviceType = "GAS",
  paymentDate = "09/26/2023",
  amount = 23.0,
  paymentStatus = "Successful",
  ...props
}) => {
  return (
    <Container
      className="flex flex-row justify-between text-[14px] font-normal leading-5 text-[#36597D]"
      type="neu"
      {...props}
    >
      <p className="ml-[30px] mr-[10px]"></p>
      <p className="mr-[10px]">{transactionId}</p>
      <p className="mr-[10px]">{provider}</p>
      <p className="mr-[10px]">{serviceType}</p>
      <p className="mr-[10px]">{paymentDate}</p>
      <p className="mr-[10px]">${amount}</p>
      <p
        className="mr-[30px] flex h-[30px] rounded-[5px] px-[10px] py-[5px]"
        style={{ background: "rgba(22, 163, 74, 0.10)" }}
      >
        <span
          className="text-center text-[14px] font-[600]"
          style={{ color: "var(--green-600, #16A34A)" }}
        >
          {paymentStatus}
        </span>
      </p>
    </Container>
  );
};

export default RecentPaymentItem;
