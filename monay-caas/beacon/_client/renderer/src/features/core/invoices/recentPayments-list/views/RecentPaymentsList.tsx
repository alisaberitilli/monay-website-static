import React from "react";

import { Container } from "#client/components/atoms";
import {
  DashboardButton,
  FilterButton,
  ListButton,
} from "#client/components/atoms/IconButton";

import RecentPaymentItem from "../list-items/RecentPaymentItem";

type Props = {};

const RecentPaymentsList = (props: Props) => {
  return (
    <div className="bg-[#F1F5F9]">
      <div className="ml-[264px] mr-[264px] ">
        <div className="flex justify-between p-[10px]">
          <p className="heading-page">Recent Payments</p>
          <div className="flex justify-between">
            <div className="">
              <FilterButton disabled={false} Icon size={"small"} />
            </div>
            <div className="ml-[5px]">
              <ListButton disabled={false} Icon size={"small"} />
            </div>
            <div className="ml-[5px]">
              <DashboardButton disabled={false} Icon size={"small"} />
            </div>
          </div>
        </div>
        <Container
          className="flex-column mb-[10px] flex justify-between text-[14px] font-semibold leading-5 text-[#36597D]"
          type="list"
          {...props}
        >
          <p style={{ marginLeft: "30px", marginRight: "10px" }}></p>
          <p style={{ marginRight: "10px" }}>Transaction ID</p>
          <p style={{ marginRight: "10px" }}>Provider</p>
          <p style={{ marginRight: "10px" }}>Service Type</p>
          <p style={{ marginRight: "10px" }}>Payment Date</p>
          <p style={{ marginRight: "10px" }}>Amount</p>
          <p style={{ marginRight: "30px" }}>Payment Status</p>
        </Container>
        <div className="mb-[10px]">
          <RecentPaymentItem />
        </div>
        <div className="mb-[10px]">
          <RecentPaymentItem />
        </div>
        <div className="mb-[10px]">
          <RecentPaymentItem />
        </div>
        <div className="mb-[10px]">
          <RecentPaymentItem />
        </div>
        <div className="mb-[10px]">
          <RecentPaymentItem />
        </div>
        <div className="mb-[10px]">
          <RecentPaymentItem />
        </div>
      </div>
    </div>
  );
};

export default RecentPaymentsList;
