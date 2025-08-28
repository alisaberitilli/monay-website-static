import { useNavigate } from "react-router-dom";

import { LoadingSkeleton } from "#client/components/animations";
import { Container, Loading } from "#client/components/atoms";
import { useApp } from "#client/features/auth/views/AuthLayout";
import DueSoonWidget from "#client/features/core/invoices/views/DueSoonWidget";

const colors = [
  "bg-green-500/20 text-green-500",
  "bg-blue-500/20 text-blue-500",
  "bg-violet-500/20 text-violet-500",
  "bg-cyan-500/20 text-cyan-500",
  "bg-orange-500/20 text-orange-500",
];

const industries = ["Retail", "Government", "Utility", "Industrial"];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { vendors, bills, loading, payments } = useApp()!;
  console.log(loading);

  return (
    <div className="h-full">
      <div className="grid-cls-1 grid h-full grid-cols-2 grid-rows-2 children:p-3">
        <div className="col-span-1 col-start-1 row-span-2 row-start-1">
          {!loading || vendors.length ? (
            <Container type="neu" padding="sm" className="overflow-hidden">
              <h2 className="mb-2 text-[18px]">Vendors ({vendors.length})</h2>
              <div className="-m-4 mb-2 max-h-[calc(100vh_-_240px)] overflow-y-scroll p-4">
                {vendors.map((vendor) => {
                  return (
                    <Container
                      key={vendor.VendorNo}
                      type="list"
                      className="mb-1 cursor-pointer p-1 transition-all duration-150 hover:shadow-md"
                      padding="xs"
                      onClick={() => navigate(`biller/${vendor.VendorNo}`)}
                    >
                      <div className="flex items-center text-sm">
                        Vendor No.{" "}
                        <code
                          className={`rounded-md ${
                            colors[vendor.VendorNo % colors.length]
                          } p-1 text-xs`}
                        >
                          {vendor.VendorNo}
                        </code>
                        <code
                          className={`ml-2 rounded-md ${
                            colors[vendor.VendorNo % colors.length]
                          } px-1 py-[2px] text-[10px]`}
                        >
                          {industries[vendor.VendorNo % industries.length]}
                        </code>
                      </div>

                      <h3 className="text-sm font-bold">{vendor.Name}</h3>
                    </Container>
                  );
                })}
              </div>
            </Container>
          ) : (
            <LoadingSkeleton>
              <div className="mb-2 flex items-end justify-between">
                <h2 className="mr-4 text-[18px]">Vendors</h2>
                <Loading size={16} />
              </div>
              <Container type="list" className="mb-1" padding="md" />
              <Container type="list" className="mb-1" padding="md" />
              <Container type="list" className="mb-1" padding="md" />
            </LoadingSkeleton>
          )}
        </div>
        {/** Invoices Due Soon Widget */}
        <div>
          {loading ? (
            <LoadingSkeleton>
              <div className="mb-2 flex items-end justify-between">
                <h2 className="mr-4 text-[18px]">Invoices Due Soon</h2>
                <Loading size={16} />
              </div>
              <Container type="list" className="mb-1" padding="lg" />
              <Container type="list" className="mb-1" padding="lg" />
            </LoadingSkeleton>
          ) : (
            <DueSoonWidget bills={bills} />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
