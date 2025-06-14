import Avatar, {
  type AppearanceType,
  type SizeType,
  type StatusType,
} from "@atlaskit/avatar";
import { cn } from "@libs/util";
import { ReactNode } from "react";
import Tooltip from "@atlaskit/tooltip";

type Props = {
  avatar?: string;
  name: ReactNode;
  isActive?: boolean;
  size?: SizeType;
  appearance?: AppearanceType;
  status?: StatusType;
};

const AvatarLabel: React.FC<Props> = ({
  avatar,
  name,
  isActive = true,
  size,
  appearance,
  status,
}) => {
  return (
    <Tooltip content={isActive ? name : `Inactive - ${name}`}>
      <div className={cn("flex gap-1 items-center", !isActive && "opacity-50")}>
        <Avatar
          src={avatar}
          size={size}
          appearance={appearance}
          status={status}
        />
        <div>{name}</div>
      </div>
    </Tooltip>
  );
};

export default AvatarLabel;
