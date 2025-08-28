import PeopleGasIcon from "#client/assets/payInvoice/Peoplegas.png";
import PepcoIcon from "#client/assets/payInvoice/PepcoIcon.png";
import WashingtonGasIcon from "#client/assets/payInvoice/WasingtonGas.png";

import Industries from "./snippet/Industries";
import PopularFeatured from "./snippet/PopularFeatured";

interface IndustriesProps {
  id?: number;
  name?: string;
  logo?: string;
}

const industriesProps: IndustriesProps[] = [
  {
    id: 1,
    name: "Industry 1",
    logo: WashingtonGasIcon,
  },
  {
    id: 2,
    name: "Industry 2",
    logo: PepcoIcon,
  },
  {
    id: 3,
    name: "Industry 2",
    logo: PepcoIcon,
  },
  {
    id: 4,
    name: "Industry 2",
    logo: PepcoIcon,
  },
  {
    id: 5,
    name: "Industry 3",
    logo: PeopleGasIcon,
  },
  {
    id: 6,
    name: "Industry 4",
    logo: PepcoIcon,
  },
  {
    id: 7,
    name: "Industry 5",
    logo: PeopleGasIcon,
  },
];

interface Billers {
  id?: number;
  service?: string;
  billerList?: any;
}

const billers: Billers[] = [
  {
    id: 1,
    service: "Electricity",
    billerList: [
      "Assam Power Distribution Company Ltd (NON-RAPDR)",
      "Ajmer Vidyut Vitran Nigam Limited (AVVNL)",
      "Bangalore Electricity Supply Co. Ltd (BESCOM)",
      "Bharatpur Electricity Services Ltd. (BESL)",
      "B.E.S.T Mumbai",
    ],
  },
  {
    id: 2,
    service: "Gas",
    billerList: [
      "Assam Power Distribution Company Ltd (NON-RAPDR)",
      "Ajmer Vidyut Vitran Nigam Limited (AVVNL)",
      "Bangalore Electricity Supply Co. Ltd (BESCOM)",
      "Bharatpur Electricity Services Ltd. (BESL)",
      "B.E.S.T Mumbai",
    ],
  },
  {
    id: 3,
    service: "Water",
    billerList: [
      "Assam Power Distribution Company Ltd (NON-RAPDR)",
      "Ajmer Vidyut Vitran Nigam Limited (AVVNL)",
      "Bangalore Electricity Supply Co. Ltd (BESCOM)",
      "Bharatpur Electricity Services Ltd. (BESL)",
      "B.E.S.T Mumbai",
    ],
  },
];

type Props = {};

const BillerSection = (props: Props) => {
  return (
    <div className="flex justify-center">
      <div className="mr-[30px]">
        <div className="mb-[30px]">
          <Industries heading="Popular Industries" details={industriesProps} />
        </div>
        <Industries
          heading="Recent Search Industries"
          details={industriesProps}
        />
      </div>
      <PopularFeatured billers={billers} />
    </div>
  );
};

export default BillerSection;
