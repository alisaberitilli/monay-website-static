import {
  Add,
  CheckboxActive,
  CheckboxInactive,
  Dashboard,
  Filter,
  List,
  Map,
  Menu,
  More,
  Robot,
  Send,
  Settings,
  Vector,
  Close
} from "#client/assets/assets";

import Button from "./Button";

interface IconButtonProps {
  Icon: SvgComponent | React.ReactNode;
  disabled?: boolean;
  size?: string;
  onClick?: () => void;
}

export const IconButton: React.FC<IconButtonProps> = ({
  disabled,
  Icon: Icon,
  size: size,
  ...props
}) => {
  return (
    <Button disabled={disabled} {...props} Icon={Icon} size={size}>
      {typeof Icon === "function" ? <Icon /> : Icon}
    </Button>
  );
};

// Button
export const ButtonRegular: React.FC = () => <Button>Button</Button>;
// Send Money
export const SendMoneyButton: React.FC<IconButtonProps> = ({
  disabled,
  size,
}) => <IconButton disabled={disabled} Icon={Send.component} size={size} />;
// Add Money
export const AddMoneyButton: React.FC<IconButtonProps> = ({
  disabled,
  size,
}) => <IconButton disabled={disabled} Icon={Add.component} size={size} />;
// Settings
export const SettingsButton: React.FC<IconButtonProps> = ({
  disabled,
  size,
}) => <IconButton disabled={disabled} Icon={Settings.component} size={size} />;
// Menu
export const MenuButton: React.FC<IconButtonProps> = ({ disabled, size }) => (
  <IconButton disabled={disabled} Icon={Menu.component} size={size} />
);
// Robot
export const RobotButton: React.FC<IconButtonProps> = ({ disabled, size }) => (
  <IconButton disabled={disabled} Icon={Robot.component} size={size} />
);
// Map
export const MapButton: React.FC<IconButtonProps> = ({ disabled, size }) => (
  <IconButton disabled={disabled} Icon={Map.component} size={size} />
);
// Vector
export const VectorButton: React.FC<IconButtonProps> = ({ disabled, size }) => (
  <IconButton disabled={disabled} Icon={Vector.component} size={size} />
);
// Dashboard
export const DashboardButton: React.FC<IconButtonProps> = ({
  disabled,
  size,
}) => <IconButton disabled={disabled} Icon={Dashboard.component} size={size} />;
// List
export const ListButton: React.FC<IconButtonProps> = ({ disabled, size }) => (
  <IconButton disabled={disabled} Icon={List.component} size={size} />
);
// Filter
export const FilterButton: React.FC<IconButtonProps> = ({ disabled, size }) => (
  <IconButton disabled={disabled} Icon={Filter.component} size={size} />
);
// More
export const MoreButton: React.FC<IconButtonProps> = ({ disabled, size }) => (
  <IconButton disabled={disabled} Icon={More.component} size={size} />
);
// Checkbox Active
export const CheckboxActiveButton: React.FC<IconButtonProps> = ({
  disabled,
  size,
}) => (
  <IconButton disabled={disabled} Icon={CheckboxActive.component} size={size} />
);
// Checkbox Inactive
export const CheckboxInactiveButton: React.FC<IconButtonProps> = ({
  disabled,
  size,
}) => (
  <IconButton
    disabled={disabled}
    Icon={CheckboxInactive.component}
    size={size}
  />
);
// Close
export const CloseButton: React.FC<IconButtonProps> = ({ disabled, size }) => (
  <IconButton disabled={disabled} Icon={Close.component} size={size} />
);