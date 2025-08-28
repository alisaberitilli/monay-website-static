import { Container } from "#client/components/atoms";

interface AssignedProfileProps {
  propic?: SvgComponent | React.ReactNode;
  name?: string;
  email?: string;
  position?: string;
}

const AssignedProfile: AssignedProfileProps[] = [
  {
    propic: "",
    name: "Ibrahim Ali",
    email: "ibrahim@tilli.pro",
    position: "Manager",
  },
  {
    propic: "",
    name: "xxxxxx xxxx",
    email: "asdfghdfg@sdfghmj.com",
    position: "Supervisor",
  },
];

const BillerUserAssignments = () => {
  // TODO: re-sort information via org chart descending before display

  return (
    <Container type="neu">
      <div className="flex items-center justify-between">
        <p className="mr-[10px] w-[] py-[5px] text-[18px] font-semibold text-[#36597D]">
          Assigned
        </p>
        <div
          className="rounded-[20px] bg-[#F1F5FC] px-[20px] py-[10px]"
          style={{
            boxShadow: "-8px -8px 16px 0px #FFF, 8px 8px 16px 0px #C9D9E8",
            border: "1px solid #FFF",
          }}
        >
          <p className="text-[14px] font-semibold text-[#36597D]">Add</p>
        </div>
      </div>
      {AssignedProfile.map((assigned, index) => (
        <div
          key={index}
          className="mt-[20px] flex items-center justify-between px-[10px] py-[5px]"
        >
          <img src="" alt="" className="mr-[10px] h-[37px] w-[38px]" />
          <div className="mr-[10px] flex-1">
            <p className="text-[16px] font-medium text-[#36597D]">
              {assigned.name}
            </p>
            <p className="text-[14px] font-medium text-[#8B9EB0]">
              {assigned.email}
            </p>
          </div>
          <div className="flex items-center justify-center rounded-[6px] bg-gradient-to-r from-blue-200 via-blue-300 to-blue-100 px-[5px] py-[2px]">
            <p className="text-[14px] font-semibold text-[#564DCD]">
              {assigned.position}
            </p>
          </div>
        </div>
      ))}
    </Container>
  );
};

export default BillerUserAssignments;
