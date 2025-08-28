import React from "react";

import { RiCheckboxCircleFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

import LogoIcon from "#client/assets/buttons/logo.png";
import { Container } from "#client/components/atoms";

interface InvoiceProps {
  invoiceId?: string;
  amount?: number;
  invoiceDate?: string;
  dueDate?: string;
  account?: {
    biller?: {
      organization?: {
        name?: string;
        image?: string;
      };
    };
  };
  status?: string;
}

const DueSoon: React.FC<InvoiceProps> = ({
  invoiceId = "001623",
  amount = 620,
  invoiceDate = "2021-02-04",
  dueDate = "2021-03-04",
  account = {},
  status = "Unpaid",
  ...props
}) => {
  const navigate = useNavigate();

  return (
    <Container
      className="relative flex cursor-pointer flex-row items-center justify-between transition-all duration-300 hover:shadow-md"
      padding="xs"
      type="list"
      onClick={() => navigate(`invoice/${invoiceId}`)}
      {...props}
    >
      <img src={LogoIcon} className="-ml-3" />
      {status === "Paid" && (
        <div className="absolute left-0 top-1 z-50 flex h-[83px] w-[79px] items-center justify-center">
          <RiCheckboxCircleFill className="text-green-500" size={36} />
        </div>
      )}
      <div className="flex-initial">
        <div className="mb-1 flex items-center leading-5 text-[#8B9EB0]">
          <p className="text-sm font-medium">Invoice ID:</p>
          <p className="ml-1 text-[10px]">{invoiceId}</p>
        </div>

        <p className="mb-1.5 text-[18px] font-bold leading-5 text-[#36597D]">
          {account?.biller?.organization?.name}
        </p>
        <p className="text-[12px] font-normal leading-normal text-[#8B9EB0]">
          Invoice date:{" "}
          {new Date(invoiceDate).toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="flex-1">
        <p className="mb-[5px] text-right text-[24px] font-bold leading-normal text-[#36597D]">
          ${amount}
        </p>
        <p className="mb-[5px] text-right text-[12px] font-normal leading-normal text-[#36597D]">
          Due date: <br />
          {new Date(dueDate).toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </Container>
  );
};

export default DueSoon;
