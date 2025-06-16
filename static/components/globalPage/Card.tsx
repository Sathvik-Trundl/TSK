import { RefreshCcw } from "lucide-react";
import { ReactNode } from "react";

type CardProps = {
  title: string;
  children: ReactNode;
  onClick: () => void;
  isLoading: boolean;
};

const Card = ({ title, children, onClick, isLoading }: CardProps) => {
  return (
    <div className="border rounded-md p-2">
      <h2 className="font-medium mb-4 flex justify-between px-2 pt-2">
        {title}{" "}
        <RefreshCcw
          onClick={onClick}
          className={isLoading ? "animate-spin repeat-infinite" : ""}
        />
      </h2>
      {children}
    </div>
  );
};

export default Card;
