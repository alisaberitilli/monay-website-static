import { NavLink } from "react-router-dom";

import { ReactComponent as MonayLogo } from "#client/assets/m-logo.svg";
import { useRootStore } from "#client/store/_root";

import { Container } from "../atoms";
import UniversalSearch from "./UniversalSearch";

const Nav: React.FC = () => {
  const rootStore = useRootStore();

  return (
    <div className="sticky top-0 z-[9999] flex w-full items-center justify-center px-6 py-3 backdrop-blur">
      <NavLink to="/">
        <Container type="neu" block={false} className="rounded-full p-[15px]">
          <MonayLogo
            height={32}
            width={32}
            className="fill-darkbg dark:fill-lightbg"
            opacity={0.8}
          />
        </Container>
      </NavLink>
      <div className="flex items-center px-6">
        <NavLink to="/billers" className="px-[10px]">
          <h2 className="text-sm font-semibold">Vendors</h2>
        </NavLink>
        {/* <NavLink to="/services" className="px-[10px]">
          <h2 className="text-sm font-semibold">Services</h2>
        </NavLink> */}
        <NavLink to="/invoices" className="px-[10px]">
          <h2 className="text-sm font-semibold">Invoices</h2>
        </NavLink>
      </div>
      <UniversalSearch />
      <div className="ml-8 flex items-center">
        <div className="text-right">
          <div>
            {rootStore?.beacon?.user.name.length
              ? rootStore.beacon.user.name
              : "Ibrahim Ali"}
          </div>
          <div className="-mt-1 text-[0.6rem]">
            ID:&nbsp;
            {rootStore?.beacon?.user.id.length
              ? rootStore.beacon.user.id
              : "12345619"}
          </div>
        </div>
        <NavLink
          to="/me"
          className="ml-2 flex h-12 w-12 items-center justify-center rounded-full border border-blue-950/50 text-lg transition-all duration-100  hover:ring hover:ring-blue-500/10 dark:border-purple-100/20"
        >
          IA
        </NavLink>
        <NavLink
          to="/organization"
          className="ml-4 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-950/50 text-lg font-bold transition-all duration-100 hover:ring hover:ring-blue-500/10 dark:border-blue-100/20"
        >
          T
        </NavLink>
      </div>
    </div>
  );
};

export default Nav;
