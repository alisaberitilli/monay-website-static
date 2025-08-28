import { useState } from "react";

import { sleep } from "#helpers";

import api from "#client/api";
import { Container, Loading } from "#client/components/atoms";
import { useApp } from "#client/features/auth/views/AuthLayout";

import PaymentSuccess from "../paymentSuccess/PaymentSuccess";
import InvoicesOverview from "./invoicesOverview/InvoicesOverview";
import PaymentMethod from "./paymentMethod/PaymentMethod";

const PayPage: React.FC = () => {
  const { selectedBills, setBills, setSelectedBills, bills } = useApp()!;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    setLoading(true);
    await sleep(5000);
    const changedBills = selectedBills.map((bill) => ({
      ...bill,
      status: "Paid",
    }));
    setBills([
      ...bills.filter((bill) => !selectedBills.includes(bill)),
      ...changedBills,
    ]);
    setSelectedBills([]);
    setSuccess(true);
    setLoading(false);
    // await api.xdex.updatePayXdex.mutate({
    //   selectedInvoices: selectedBills.map((bill) => ({
    //     invoiceNumber: bill.invoiceNumber.toString(),
    //   })),
    //   totalAmount: selectedBills
    //     .reduce((acc, bill) => (acc += bill.amount), 0)
    //     .toString(),
    // });
  };

  return (
    <>
      <div className="flex">
        <InvoicesOverview />
        {selectedBills.length ? (
          <PaymentMethod submit={submit} />
        ) : (
          <Container className="ml-2">
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold">
              Please select some bills.
            </div>
          </Container>
        )}
      </div>
      {loading && (
        <div className="fixed left-0 top-0 z-[999999] flex h-full w-full items-center justify-center bg-black/50">
          <Loading size={60} color="white" />
        </div>
      )}
      {success && (
        <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center">
          <Container type="neu">
            <PaymentSuccess />
          </Container>
        </div>
      )}
    </>
  );
};

export default PayPage;
