import { createContext, useContext, useEffect, useState } from "react";

import { sleep } from "#helpers";
import { observer } from "mobx-react-lite";
import { Link, Outlet, useRouteError } from "react-router-dom";

import api from "#client/api";
import { Container } from "#client/components/atoms";
import { Footer, Nav } from "#client/components/singletons";

export interface Bill {
  buyerCode: number;
  buyer: string;
  amount: number;
  dueDate: string;
  invoiceDate: string;
  invoiceNumber: number;
  status?: string;
}
export interface Vendor {
  VendorNo: number;
  Name: string;
}
interface Payment {
  asdf?: unknown;
}
interface AppContextData {
  vendors: Vendor[];
  bills: Bill[];
  selectedBills: Bill[];
  loading: boolean;
  payments: Payment[];
}
interface AppContextFuncs {
  setVendors: (vendors: Vendor[]) => void;
  setBills: (bills: Bill[]) => void;
  setSelectedBills: (bills: Bill[]) => void;
  setLoading: (loading: boolean) => void;
  setPayments: (payments: Payment[]) => void;
}
type AppContextType = AppContextData & AppContextFuncs;
const AppContext = createContext<AppContextType | null>(null);
export const useApp = () => useContext(AppContext);

let count = 0;
const AuthLayout: React.FC = () => {
  const error = useRouteError();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBills, setSelectedBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.user.logSession.mutate();
  }, []);

  const getVendors = async () => {
    const vendorResponse = await api.xdex.fetchVendorCode.query({
      companyCode: "1005",
    });
    const vendors = vendorResponse.response.sort(
      (a, b) => a.VendorNo - b.VendorNo
    );
    setVendors(vendors);
    return vendors;
  };

  const getBills = async () => {
    try {
      // FIXME FIXME FIXME FIXME FIXME
      // xdex really does not like having multiple requests in parallel. this introduces artificial delay (POORLY) (CHANGE THIS)
      count++;
      if (count > 3) count = 0;
      await sleep(count * 750);
      const bills = await api.xdex.fetchXdexData.query({
        buyerCode: 812,
        compCode: 1005,
        mobileNumber: "9898989898",
      });
      setBills(
        bills.invoiceDetails.map((invoice) => ({
          ...invoice,
          buyerCode: 812,
          buyer: "Portage County Treasurer",
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const getAll = async () => {
    setLoading(true);
    await getVendors();
    await getBills();
    setLoading(false);
  };

  useEffect(() => {
    if (!bills.length) getAll();
  }, []);

  const renderError = () => {
    return (
      <Container type="neu" className="">
        <div className="flex flex-col">
          <Link to="/" className="pb-2">
            ⬅️ Go Back
          </Link>
          Full Error:
          <code className="rounded-md bg-black/10 p-2 text-xs">
            {JSON.stringify(error)}
          </code>
        </div>
      </Container>
    );
  };

  return (
    <div className="flex h-screen w-full flex-col">
      <Nav />
      <AppContext.Provider
        value={{
          vendors,
          bills,
          selectedBills,
          payments,
          setVendors,
          setBills,
          setSelectedBills,
          setPayments,
          loading,
          setLoading,
        }}
      >
        <div className="w-full flex-grow">
          <div className="mx-auto max-w-[1260px] px-[30px] pt-4">
            {error ? renderError() : <Outlet />}
          </div>
        </div>
      </AppContext.Provider>
      <Footer />
    </div>
  );
};

export default observer(AuthLayout);
