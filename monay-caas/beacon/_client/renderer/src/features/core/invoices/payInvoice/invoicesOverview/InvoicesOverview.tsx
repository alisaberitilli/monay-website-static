import { Disclosure } from "@headlessui/react";

import LogoIcon from "#client/assets/buttons/logo.png";
import Arrow from "#client/assets/payInvoice/Arrow.png";
import CheckboxActiveIcon from "#client/assets/payInvoice/CheckboxActive.png";
import CheckboxInactiveIcon from "#client/assets/payInvoice/CheckboxInactive.png";
import CheckboxSemiactiveIcon from "#client/assets/payInvoice/CheckboxSemiactive.png";
// import PeopleGas from "#client/assets/payInvoice/Peoplegas.png";
// import WasingtonGas from "#client/assets/payInvoice/WasingtonGas.png";
import { Container } from "#client/components/atoms";
import { useApp } from "#client/features/auth/views/AuthLayout";

type Props = {};

const InvoicesOverview = (props: Props) => {
  const { bills, vendors, setSelectedBills, selectedBills } = useApp()!;

  const vendorsToShow = vendors.filter((vendor) =>
    bills.some(
      (bill) => bill.buyerCode === vendor.VendorNo && bill.status !== "Paid"
    )
  );

  return (
    <div className="">
      <Container>
        <p className="mb-[15px] flex w-[420px] flex-col items-stretch justify-end text-[20px] font-[700] text-[#36597D]">
          Invoices overview
        </p>
        {vendorsToShow.length === 0 && (
          <div className="">No invoices to pay!</div>
        )}
        {vendorsToShow.map((vendor) => {
          const vendorBills = bills.filter(
            (bill) =>
              bill.buyerCode === vendor.VendorNo && bill.status !== "Paid"
          );
          const vendorIsSelected = vendorBills.every((bill) =>
            selectedBills.includes(bill)
          );
          const someBillsSelected = vendorBills.some((bill) =>
            selectedBills.includes(bill)
          );
          return (
            <Disclosure key={vendor.VendorNo}>
              {({ open }) => (
                <Container type="dropdown" {...props}>
                  <Disclosure.Button className="w-[100%]">
                    <div className="flex items-center justify-center">
                      <div style={{ display: "flex" }} className="items-start">
                        <img
                          style={{
                            height: "24px",
                            width: "24px",
                            marginRight: "5px",
                            marginTop: "10px",
                          }}
                          src={
                            vendorIsSelected
                              ? CheckboxActiveIcon
                              : someBillsSelected
                              ? CheckboxSemiactiveIcon
                              : CheckboxInactiveIcon
                          }
                          alt="checkbox not select"
                          onClick={() =>
                            setSelectedBills(
                              vendorIsSelected
                                ? selectedBills.filter(
                                    (bill) => bill.buyerCode !== vendor.VendorNo
                                  )
                                : bills.filter(
                                    (bill) => bill.buyerCode === vendor.VendorNo
                                  )
                            )
                          }
                        />
                        <img
                          style={{
                            height: "50px",
                            width: "50px",
                            marginRight: "",
                          }}
                          src={LogoIcon}
                          alt={"Logo for " + vendor.Name}
                        />
                        <p
                          style={{
                            color: "#36597D",
                            fontSize: "16px",
                            fontWeight: "600",
                            marginTop: "15px",
                          }}
                          className="text-left"
                        >
                          {vendor.Name}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          marginLeft: "auto",
                          marginRight: "0",
                        }}
                      >
                        <p
                          style={{
                            color: "#36597D",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          $
                          {bills
                            .filter(
                              (bill) => bill.buyerCode === vendor.VendorNo
                            )
                            .reduce((acc, curr) => acc + curr.amount, 0)
                            .toFixed(2)}
                        </p>
                        <img
                          className={`${
                            open ? "rotate-180 transform" : ""
                          } h-5 w-5`}
                          style={{ height: "24px", width: "24px" }}
                          src={Arrow}
                          alt="Arrow"
                        />
                      </div>
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel>
                    {bills
                      .filter((bill) => bill.buyerCode === vendor.VendorNo)
                      .map((bill) => {
                        const isSelected = selectedBills.includes(bill);
                        return (
                          <div
                            key={bill.invoiceNumber}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div style={{ display: "flex", marginTop: "20px" }}>
                              <img
                                style={{
                                  height: "24px",
                                  width: "24px",
                                  marginRight: "20px",
                                  marginTop: "10px",
                                }}
                                className="cursor-pointer"
                                src={
                                  isSelected
                                    ? CheckboxActiveIcon
                                    : CheckboxInactiveIcon
                                }
                                alt="checkbox not select"
                                onClick={() =>
                                  setSelectedBills(
                                    isSelected
                                      ? selectedBills.filter(
                                          (sBill) => sBill !== bill
                                        )
                                      : [...selectedBills, bill]
                                  )
                                }
                              />
                              <div style={{}}>
                                <p
                                  style={{
                                    color: "#36597D",
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    marginTop: "",
                                  }}
                                >
                                  {bill.invoiceNumber}
                                </p>
                                <p
                                  style={{
                                    color: "#36597D",
                                    fontSize: "14px",
                                    fontWeight: "400",
                                  }}
                                >
                                  Issued date:{" "}
                                  {new Date(
                                    bill.invoiceDate
                                  ).toLocaleDateString("en-US", {
                                    month: "numeric",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                marginLeft: "auto",
                                marginRight: "25px",
                              }}
                            >
                              <p
                                style={{
                                  color: "#36597D",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  marginTop: "10px",
                                }}
                              >
                                ${bill.amount}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </Disclosure.Panel>
                </Container>
              )}
            </Disclosure>
          );
        })}
      </Container>
    </div>
  );
};

export default InvoicesOverview;
