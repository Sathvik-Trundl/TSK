import Spinner, { Size } from "@atlaskit/spinner";
import { cn } from "@libs/util";

type Props = {
  type: "full" | "adjust" | "portal" | "transparent";
  size?: Size;
  className?: string;
};

const Loader: React.FC<Props> = ({ type, className, size = "large" }) => {
  if (type === "transparent") {
    return (
      <div className={cn(className)}>
        <Spinner size={size} />
      </div>
    );
  }
  
  if (type === "portal") {
    return (
      <div
        className={cn(
          "bg-elevation.surface z-2000",
          "fixed grid place-items-center top-0 h-screen w-screen",
          className
        )}
      >
        <Spinner size={size} />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "bg-elevation.surface",
        type === "full" ? "w-screen h-screen grid place-items-center" : "",
        className
      )}
    >
      <Spinner size={size} />
    </div>
  );
};

export default Loader;
