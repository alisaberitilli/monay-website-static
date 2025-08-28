import { useEffect, useState } from "react";

import { sleep } from "#helpers";
import { Link, useParams } from "react-router-dom";

import api from "#client/api";
import { LoadingSkeleton } from "#client/components/animations";
import { Button } from "#client/components/atoms";
import { Bill, useApp } from "#client/features/auth/views/AuthLayout";
import InvoiceList from "#client/features/core/invoices/views/InvoiceList";

import AtGlance from "../widget/AtGlance";
import BillerAccounts from "../widget/BillerAccounts";
import BillerAuditLog from "../widget/BillerAuditLog";
import BillerInvoiceList from "../widget/BillerInvoiceList";
import BillerMetadata from "../widget/BillerMetadata";
import BillerPaymentLog from "../widget/BillerPaymentLog";
import BillerUserAssignments from "../widget/BillerUserAssignments";
import TotalBalance from "../widget/TotalBalance";

const BillerPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { billerId } = useParams();
  // const { bills, setBills, vendors } = useApp()!;

  // const biller = vendors.find(
  //   (vendor) => vendor.VendorNo.toString() === billerId
  // )!;
  // const billerBills = bills.filter(
  //   (bill) => bill.buyerCode === biller.VendorNo
  // );

  // const getBills = async () => {
  //   setLoading(true);
  //   // FIXME
  //   // RANDOM DELAY PLS REMOVE
  //   await sleep(Math.floor(Math.random() * 3000));
  //   try {
  //     const bBills = (await api.xdex.fetchXdexData.query({
  //       compCode: 1005,
  //       buyerCode: biller.VendorNo,
  //       mobileNumber: "9898989898",
  //     })) as Bill[];
  //     if (bBills?.length) {
  //       setBills([
  //         ...bills.filter((bill) => bill.buyerCode !== biller.VendorNo),
  //         ...bBills,
  //       ]);
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  //   setLoading(false);
  // };

  // useEffect(() => {
  //   getBills();
  // }, []);

  return (
    <>
      {/* <div className="mb-4 flex w-full items-center">
        <h1>{biller.Name}</h1>
        <span className="ml-2 rounded-md bg-black/20 px-2 py-1">
          Vendor #{biller.VendorNo}
        </span>
        {!loading && (
          <div className="ml-auto">
            <Link to="/pay">
              <Button intent="primary">Pay</Button>
            </Link>
          </div>
        )}
      </div> */}
      {loading ? (
        <LoadingSkeleton></LoadingSkeleton>
      ) : (
        <>
          <InvoiceList incomingBills={[]} hideHeader />
          <div className="grid grid-cols-[67%_30%] gap-x-[30px]">
            <div className="grid gap-y-[30px] gap-x-[30px] grid-cols-[31%_65%]">
              <TotalBalance />
              <AtGlance />
              <div className="col-start-1 col-end-3"><BillerInvoiceList /></div>
              <div className="col-start-1 col-end-3"><BillerPaymentLog /></div>
              <div className="col-start-1 col-end-3"><BillerPaymentLog /></div>
            </div>
            <div className="grid gap-y-[30px]">
              <BillerMetadata />
              <BillerAccounts />
              <BillerUserAssignments />
              <BillerAuditLog />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BillerPage;
