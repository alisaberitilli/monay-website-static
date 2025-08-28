import { ReactComponent as AddIcon } from "#client/assets/buttons/Add.svg";
import { ReactComponent as DashboardIcon } from "#client/assets/buttons/Dashboard.svg";
import { ReactComponent as FilterIcon } from "#client/assets/buttons/Filter.svg";
import { ReactComponent as ListIcon } from "#client/assets/buttons/List.svg";
import { ReactComponent as MapIcon } from "#client/assets/buttons/Maps.svg";
import { ReactComponent as MenuIcon } from "#client/assets/buttons/Menu.svg";
import { ReactComponent as MoreIcon } from "#client/assets/buttons/More.svg";
import { ReactComponent as RobotIcon } from "#client/assets/buttons/Robot.svg";
import { ReactComponent as SendIcon } from "#client/assets/buttons/Send.svg";
import { ReactComponent as SettingsIcon } from "#client/assets/buttons/Settings.svg";
import { ReactComponent as VectorIcon } from "#client/assets/buttons/Vector.svg";
import { ReactComponent as CheckboxActiveIcon } from "#client/assets/forms/CheckboxActive.svg";
import { ReactComponent as CheckboxInactiveIcon } from "#client/assets/forms/CheckboxInactive.svg";
import { ReactComponent as RadioActiveIcon } from "#client/assets/forms/RadioActive.svg";
import { ReactComponent as RadioInactiveIcon } from "#client/assets/forms/RadioInactive.svg";
import { ReactComponent as CloseIcon } from "#client/assets/buttons/Close.svg";

interface SvgAsset {
  component: SvgComponent | React.ReactNode;
  name: string;
}

// Buttons
export const Send: SvgAsset = { component: SendIcon, name: "send" };
export const Add: SvgAsset = { component: AddIcon, name: "add" };
export const Settings: SvgAsset = { component: SettingsIcon, name: "settings" };
export const Menu: SvgAsset = { component: MenuIcon, name: "menu" };
export const Robot: SvgAsset = { component: RobotIcon, name: "robot" };
export const Map: SvgAsset = { component: MapIcon, name: "map" };
export const Vector: SvgAsset = { component: VectorIcon, name: "vector" };
export const Dashboard: SvgAsset = {
  component: DashboardIcon,
  name: "dashboard",
};
export const List: SvgAsset = { component: ListIcon, name: "list" };
export const Filter: SvgAsset = { component: FilterIcon, name: "filter" };
export const More: SvgAsset = { component: MoreIcon, name: "more" };
export const Close: SvgAsset = { component: CloseIcon, name: "close" };
export const CheckboxActive: SvgAsset = {
  component: CheckboxActiveIcon,
  name: "checkbox-active",
};
export const CheckboxInactive: SvgAsset = {
  component: CheckboxInactiveIcon,
  name: "checkbox-inactive",
};

// Forms
export const RadioActive: SvgAsset = {
  component: RadioActiveIcon,
  name: "radio-active",
};
export const RadioInactive: SvgAsset = {
  component: RadioInactiveIcon,
  name: "radio-inactive",
};
