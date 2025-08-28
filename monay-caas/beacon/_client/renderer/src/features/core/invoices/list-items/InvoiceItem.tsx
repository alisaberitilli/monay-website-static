import React from "react";

import { Container } from "#client/components/atoms";

interface InvoiceItemProps {
  invoiceNumber?: string;
  amount?: number;
  invoiceDate?: string;
  dueDate?: string;
  charges?: string;
  status?: string;
}

const InvoiceItem: React.FC<InvoiceItemProps> = ({
  invoiceNumber = "201180533505",
  amount = 126.21,
  invoiceDate = "08/26/2023",
  dueDate = "09/26/2023",
  charges = 0.0,
  status = "Paid",
  ...props
}) => {
  const unpaid = "bg-red-600/10";
  const paid = "bg-green-600/10";
  return (
    <Container
      className="flex flex-row mb-[10px] items-center justify-between text-[14px] font-normal leading-5 text-[#36597D]"
      type="neu"
      {...props}
    >
      <td className="min-w-[16%] flex justify-center">{invoiceNumber}</td>
      <td className="min-w-[16%] flex justify-center">{invoiceDate}</td>
      <td className="min-w-[16%] flex justify-center">${amount}</td>
      <td className="min-w-[16%] flex justify-center">${charges}</td>
      <td className="min-w-[16%] flex justify-center">{dueDate}</td>
      <td className={`min-w-[16%] flex justify-center`}>
        <p className={`rounded-[5px] p-2  ${status === "Paid" ? paid : unpaid}`}>{status}</p>
      </td>
      {/* <p>{status}</p> */}
    </Container>
  );
};

export default InvoiceItem;
