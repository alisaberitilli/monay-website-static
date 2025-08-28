import { useState } from "react";

import { RadioGroup } from "@headlessui/react";

import "#client/assets/container.css";
import trash from "#client/assets/payInvoice/Trash.png";
import radio from "#client/assets/payInvoice/radio.png";
import radioDisable from "#client/assets/payInvoice/radioDisable.png";
import visaCard from "#client/assets/payInvoice/visaCard.png";
import { Container } from "#client/components/atoms";

interface Card {
  id?: number;
  cardImg?: { [key: string]: unknown };
  cardLastFourDigit?: number;
  expDate?: string;
  lastUsedInfo?: boolean;
}

const cards: Card[] = [
  {
    id: 1,
    cardImg: { visaCard },
    cardLastFourDigit: 4321,
    expDate: "12/30",
    lastUsedInfo: true,
  },
  {
    id: 2,
    cardImg: { visaCard },
    cardLastFourDigit: 8353,
    expDate: "12/25",
    lastUsedInfo: false,
  },
];

interface CardPaymentProps {
  cardLastFourDigit?: number;
  expDate?: string;
}

const CardPayment: React.FC<CardPaymentProps> = ({
  cardLastFourDigit = 4321,
  expDate = "12/30",
  ...props
}) => {
  const [selected, setSelected] = useState(cards[0]);

  return (
    <>
      <div className="mb-[15px] ml-[auto] flex justify-end text-[14px] font-[700] text-[#564DCD]">
        add card
      </div>
      <div className="mb-[10px]">
        <RadioGroup value={selected} onChange={setSelected}>
          {cards.map((card) => (
            <RadioGroup.Option key={card.id} value={card}>
              {({ active, checked }) => (
                <Container
                  className={`${
                    active || checked ? "" : ""
                  } mt-[5px] flex h-[90px] cursor-pointer items-center justify-center`}
                  type={active || checked ? "dropdown" : "default"}
                  {...props}
                >
                  <div className="flex items-center justify-between">
                    <img
                      className="mr-[20px]"
                      src={active || checked ? radioDisable : radioDisable}
                      alt="radio"
                    />
                    <div>
                      <img
                        className="mr-[20px] h-[50px] w-[50px]"
                        src={visaCard}
                        alt="visaCard"
                      />
                    </div>
                    <div>
                      <p className="text-[18px] font-[600] text-[#36597D]">
                        **** **** **** {cardLastFourDigit}
                      </p>
                      <p className="text-[12px] font-[400] text-[#36597D]">
                        Expires on {expDate}
                      </p>
                    </div>
                  </div>
                  <div className="ml-[auto] mr-[0] flex">
                    {card.lastUsedInfo && (
                      <>
                        <div className="mr-[20px] rounded-[10px] bg-[#DCFCE7] px-[10px] py-[5px]">
                          <p className="text-[14px] font-[600] text-[#16A34A]">
                            Last used
                          </p>
                        </div>
                        <div>
                          <img src={trash} alt="trash" />
                        </div>
                      </>
                    )}
                  </div>
                </Container>
              )}
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      </div>
    </>
  );
};

export default CardPayment;
