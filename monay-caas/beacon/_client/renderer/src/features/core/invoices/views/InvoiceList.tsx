import { Container } from "#client/components/atoms";
import {
  DashboardButton,
  FilterButton,
  ListButton,
  SettingsButton,
} from "#client/components/atoms/IconButton";
import { Bill, useApp } from "#client/features/auth/views/AuthLayout";

import InvoiceItem from "../list-items/InvoiceItem";

interface InvoiceListProps {
  incomingBills?: Bill[];
  hideHeader?: boolean;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  incomingBills = [],
  hideHeader = false,
}) => {
  return (
    <div className="bg-[#F1F5F9]">
      <div className="">
        {/* <div className="flex justify-between p-[10px]">
          <p>Invoices</p>
          <div className="flex justify-between">
            <div className="">
              <DashboardButton disabled={false} Icon size={"small"} />
            </div>
            <div className="ml-[5px]">
              <ListButton disabled={false} Icon size={"small"} />
            </div>
            <div className="ml-[5px]">
              <FilterButton disabled={false} Icon size={"small"} />
            </div>
          </div>
        </div> */}
        <table className="w-[100%]">
          {!hideHeader && (
            <tr>
              <Container
                className="flex-column sticky top-0 mb-[10px] flex justify-between text-[14px] font-semibold leading-5 text-[#36597D]"
                type="list"
                // {...props}
              >
                <th className="w-[16%]">Invoice Number</th>
                <th className="w-[16%]">Date</th>
                <th className="w-[16%]">Amount</th>
                <th className="w-[16%]">Charges</th>
                <th className="w-[16%]">Due Date</th>
                <th className="w-[16%]">Status</th>
                {/* <p>Pay</p> */}
              </Container>
            </tr>
          )}
          {incomingBills.map((bill) => {
            return (
              <div key={bill.invoiceNumber} className="mb-[10px]">
                <InvoiceItem
                  amount={bill.amount}
                  invoiceNumber={bill.invoiceNumber.toString()}
                  invoiceDate={new Date(bill.invoiceDate).toLocaleDateString(
                    "en-US",
                    { month: "numeric", day: "numeric", year: "numeric" }
                  )}
                  dueDate={new Date(bill.dueDate).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                  })}
                  status={bill?.status ?? "Unpaid"}
                />
              </div>
            );
          })}
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;
