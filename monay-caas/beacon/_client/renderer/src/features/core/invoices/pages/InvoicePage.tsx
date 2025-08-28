import { useLocation, useParams } from "react-router-dom";

import { Container } from "#client/components/atoms";
import { useApp } from "#client/features/auth/views/AuthLayout";

import InvoiceItem from "../list-items/InvoiceItem";

const InvoicePage: React.FC = () => {
  const location = useLocation();
  const { invoiceId } = useParams();
  const { bills } = useApp()!;
  const bill = bills.find((b) => b.invoiceNumber.toString() === invoiceId)!;
  return (
    <>
      <Container
        className="flex-column sticky top-0 mb-[10px] flex justify-between text-[14px] font-semibold leading-5 text-[#36597D]"
        type="list"
        // {...props}
      >
        <p>Invoice Number</p>
        <p>Date</p>
        <p>Amount</p>
        <p>Charges</p>
        <p>Due Date</p>
        <p>Status</p>
      </Container>
      <InvoiceItem
        invoiceNumber={bill.invoiceNumber.toString()}
        amount={bill.amount}
        invoiceDate={new Date(bill.invoiceDate).toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        })}
        dueDate={new Date(bill.dueDate).toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        })}
        status={bill?.status ?? "Unpaid"}
      />
    </>
  );
};

export default InvoicePage;
