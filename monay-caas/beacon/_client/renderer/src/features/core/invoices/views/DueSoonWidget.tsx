import { Link } from "react-router-dom";

import { Button, Container } from "#client/components/atoms";

import DueSoon from "../list-items/DueSoon";

interface Bill {
  buyerCode: number;
  buyer: string;
  amount: number;
  dueDate: string;
  invoiceDate: string;
  invoiceNumber: number;
  status?: string;
}
type Props = {
  bills: Bill[];
};

const DueSoonWidget = (props: Props) => {
  return (
    <Container className="relative" padding="sm" {...props} type="neu">
      <div className="flex justify-between">
        <h2 className="mb-2 text-[18px]">Invoices Due Soon</h2>
        <Link to="/pay">
          <Button intent="primary" size="small" className="h-8">
            Pay
          </Button>
        </Link>
      </div>
      {props.bills.map((bill) => (
        <div key={bill.invoiceNumber} className="mb-[10px]">
          <DueSoon
            invoiceId={bill.invoiceNumber.toString()}
            amount={bill.amount}
            dueDate={bill.dueDate}
            invoiceDate={bill.invoiceDate}
            account={{ biller: { organization: { name: bill.buyer } } }}
            status={bill.status}
          />
        </div>
      ))}
    </Container>
  );
};

export default DueSoonWidget;
